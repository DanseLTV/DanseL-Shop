import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import type { User } from '@supabase/supabase-js'
import {
  supabase,
  isSupabaseConfigured,
  type UserProfile,
} from '../lib/supabase'
import { checkIsAdminUid } from '../lib/adminCheck'
import {
  isValidUsername,
  normalizeUsername,
  normalizeLoginIdentifier,
  isAccountVerified,
} from '../utils/authHelpers'
import {
  mapAuthError,
  isEmailAlreadyVerifiedError,
  isIgnorableSignupEmailError,
  isUserAlreadyRegisteredError,
} from '../utils/authErrors'
import { normalizeOtpInput } from '../constants/authOtp'
import { isAdminEmail } from '../constants/admin'
import { withTimeoutOr } from '../utils/asyncHelpers'

interface SignInResult {
  error: string | null
  user: User | null
  /** Resolved email when identifier was username or email (for resend confirmation). */
  loginEmail?: string | null
}

interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  isAdmin: boolean
  adminVerified: boolean | null
  isConfigured: boolean
  signUp: (
    email: string,
    password: string,
    username: string
  ) => Promise<{ error: string | null; email?: string }>
  verifySignupOtp: (email: string, token: string) => Promise<{ error: string | null }>
  resendSignupOtp: (email: string) => Promise<{ error: string | null }>
  signIn: (identifier: string, password: string) => Promise<SignInResult>
  signInWithEmail: (email: string, password: string) => Promise<SignInResult>
  resendConfirmationEmail: (email: string) => Promise<{ error: string | null }>
  requestPasswordResetOtp: (email: string) => Promise<{ error: string | null }>
  verifyRecoveryOtp: (email: string, token: string) => Promise<{ error: string | null }>
  resetPasswordAfterRecovery: (email: string, newPassword: string) => Promise<{ error: string | null }>
  resetPasswordWithOtp: (
    email: string,
    token: string,
    newPassword: string
  ) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  deleteAccount: (username: string) => Promise<{ error: string | null }>
  refreshProfile: () => Promise<void>
  verifyAdmin: (userId?: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function mapProfile(row: Record<string, unknown>): UserProfile {
  const username =
    (row.username as string) ||
    (row.full_name as string) ||
    'user'
  return {
    id: row.id as string,
    username,
    email: (row.email as string) || '',
    phone: (row.phone as string) || '',
    role: row.role as UserProfile['role'],
    created_at: row.created_at as string | undefined,
    email_verified_at: (row.email_verified_at as string | null | undefined) ?? null,
    full_name: row.full_name as string | undefined,
  }
}

function minimalProfileFromUser(sessionUser: User): UserProfile {
  const meta = sessionUser.user_metadata as { username?: string; phone?: string } | undefined
  const username =
    meta?.username ||
    sessionUser.email?.split('@')[0] ||
    'user'
  return {
    id: sessionUser.id,
    username: String(username).toLowerCase(),
    email: sessionUser.email ?? '',
    phone: meta?.phone ?? '',
    role: 'customer',
    email_verified_at: sessionUser.email_confirmed_at
      ? new Date().toISOString()
      : null,
  }
}

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, email, full_name, phone, role, created_at, email_verified_at')
      .eq('id', userId)
      .maybeSingle()

    if (error || !data) {
      if (error) console.warn('fetchProfile error', error)
      return null
    }
    return mapProfile(data as Record<string, unknown>)
  } catch (err) {
    console.warn('fetchProfile threw', err)
    return null
  }
}

async function syncProfileVerification(): Promise<void> {
  if (!supabase) return
  try {
    await Promise.race([
      supabase.rpc('sync_email_verified_status'),
      new Promise<void>((resolve) => setTimeout(resolve, 3000)),
    ])
  } catch {
    /* RPC may not exist until patch-login-sync.sql is run */
  }
}

async function hydrateSession(sessionUser: User, options?: { fast?: boolean }): Promise<{
  profile: UserProfile | null
  verified: boolean
}> {
  const profile = await withTimeoutOr(
    fetchProfile(sessionUser.id),
    options?.fast ? 6000 : 10000,
    null
  )

  if (!isAccountVerified(profile, sessionUser)) {
    return { profile, verified: false }
  }

  if (!options?.fast && profile && !profile.email_verified_at && sessionUser.email_confirmed_at) {
    await syncProfileVerification()
    const synced = await withTimeoutOr(fetchProfile(sessionUser.id), 5000, null)
    return { profile: synced ?? profile, verified: true }
  }

  return {
    profile: profile ?? minimalProfileFromUser(sessionUser),
    verified: true,
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (err) => {
        clearTimeout(timer)
        reject(err)
      }
    )
  })
}

async function resolveLoginEmail(identifier: string): Promise<string | null> {
  if (!supabase) return null
  const normalized = normalizeLoginIdentifier(identifier)
  if (!normalized) return null

  if (normalized.includes('@')) {
    return normalized.toLowerCase()
  }

  try {
    const email = await withTimeoutOr(
      (async () => {
        const { data, error } = await supabase.rpc('get_login_email', {
          identifier: normalized,
        })
        if (error || !data) return null
        return data as string
      })(),
      6000,
      null
    )
    return email
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [adminVerified, setAdminVerified] = useState<boolean | null>(null)
  /** Prevents onAuthStateChange from racing signInWithPassword (Supabase deadlock). */
  const authInFlightRef = useRef(false)

  const verifyAdmin = useCallback(async (userId?: string) => {
    const id = userId ?? user?.id
    if (!id) {
      setAdminVerified(false)
      return false
    }
    const check = await checkIsAdminUid(id)
    setAdminVerified(check.isAdmin)
    return check.isAdmin
  }, [user?.id])

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null)
      return
    }
    const p = await fetchProfile(user.id)
    setProfile(p)
    if (p?.role === 'admin') setAdminVerified(true)
  }, [user])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    let cancelled = false
    const safety = setTimeout(() => {
      if (!cancelled) setLoading(false)
    }, 8000)

    const init = async () => {
      try {
        const { data: { session } } = await withTimeoutOr(
          supabase!.auth.getSession(),
          8000,
          { data: { session: null }, error: null }
        )
        if (cancelled) return
        const sessionUser = session?.user ?? null
        if (!sessionUser) {
          setUser(null)
          setProfile(null)
          return
        }

        const { profile: p, verified } = await hydrateSession(sessionUser)
        if (cancelled) return

        if (!verified) {
          await supabase!.auth.signOut()
          if (!cancelled) {
            setUser(null)
            setProfile(null)
            setAdminVerified(null)
          }
          return
        }

        if (!cancelled) {
          setUser(sessionUser)
          setProfile(p)
        }
        if (!cancelled && (p?.role === 'admin' || isAdminEmail(sessionUser.email))) {
          setAdminVerified(true)
        } else if (!cancelled) {
          const isAdm = await withTimeoutOr(
            checkIsAdminUid(sessionUser.id),
            5000,
            { isAdmin: false }
          )
          if (!cancelled) setAdminVerified(isAdm.isAdmin)
        }
      } catch (err) {
        console.warn('Auth init failed', err)
      } finally {
        if (!cancelled) {
          clearTimeout(safety)
          setLoading(false)
        }
      }
    }
    init()

  // Only handle sign-out here. Sign-in is handled in signInWithEmail to avoid Supabase deadlocks.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event !== 'SIGNED_OUT') return
      if (cancelled) return
      setUser(null)
      setProfile(null)
      setAdminVerified(null)
      setLoading(false)
    })

    return () => {
      cancelled = true
      clearTimeout(safety)
      subscription.unsubscribe()
    }
  }, [])

  const signInWithEmail = async (email: string, password: string): Promise<SignInResult> => {
    if (!supabase) {
      return { error: 'Auth is not configured. See AUTH_SETUP.md', user: null }
    }

    const loginEmail = email.trim().toLowerCase()
    authInFlightRef.current = true

    try {
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({ email: loginEmail, password }),
        15000,
        'Login timed out. Check your connection and try again.'
      )

      if (error) {
        return {
          error: mapAuthError(error.message),
          user: null,
          loginEmail,
        }
      }

      const sessionUser = data.user ?? data.session?.user ?? null
      if (!sessionUser) {
        return { error: 'Sign in failed. Please try again.', user: null, loginEmail }
      }

      const { profile: hydratedProfile, verified } = await hydrateSession(sessionUser, {
        fast: true,
      })

      if (!verified) {
        void supabase.auth.signOut()
        setUser(null)
        setProfile(null)
        setAdminVerified(null)
        return {
          error: mapAuthError('Email not confirmed'),
          user: null,
          loginEmail,
        }
      }

      const activeProfile = hydratedProfile ?? minimalProfileFromUser(sessionUser)
      setUser(sessionUser)
      setProfile(activeProfile)

      if (activeProfile.role === 'admin' || isAdminEmail(loginEmail)) {
        setAdminVerified(true)
        if (isAdminEmail(loginEmail) && activeProfile.role !== 'admin') {
          setProfile({ ...activeProfile, role: 'admin' })
        }
      } else {
        setAdminVerified(false)
        void withTimeoutOr(checkIsAdminUid(sessionUser.id), 5000, { isAdmin: false }).then(
          (check) => {
            if (!check.isAdmin) return
            setAdminVerified(true)
          }
        )
      }

      void fetchProfile(sessionUser.id).then((full) => {
        if (full) setProfile(full)
      })

      return { error: null, user: sessionUser, loginEmail }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed'
      return { error: mapAuthError(message), user: null, loginEmail }
    } finally {
      authInFlightRef.current = false
    }
  }

  const resendConfirmationEmail = async (email: string) => {
    return issueEmailOtp(email, 'signup')
  }

  const issueEmailOtp = async (email: string, purpose: 'signup' | 'recovery') => {
    if (!supabase) {
      return { error: 'Auth is not configured. See AUTH_SETUP.md' }
    }

    const { error } = await supabase.rpc('issue_email_otp', {
      p_email: email.trim().toLowerCase(),
      p_purpose: purpose,
    })

    return { error: error ? mapAuthError(error.message) : null }
  }

  const requestPasswordResetOtp = async (email: string) => {
    return issueEmailOtp(email, 'recovery')
  }

  const verifyRecoveryOtp = async (email: string, token: string) => {
    if (!supabase) {
      return { error: 'Auth is not configured. See AUTH_SETUP.md' }
    }

    const { error } = await supabase.rpc('verify_recovery_email_otp', {
      p_email: email.trim().toLowerCase(),
      p_code: normalizeOtpInput(token),
    })

    return { error: error ? mapAuthError(error.message) : null }
  }

  const resetPasswordAfterRecovery = async (email: string, newPassword: string) => {
    if (!supabase) {
      return { error: 'Auth is not configured. See AUTH_SETUP.md' }
    }

    const { error } = await supabase.rpc('reset_password_after_recovery', {
      p_email: email.trim().toLowerCase(),
      p_new_password: newPassword,
    })

    return { error: error ? mapAuthError(error.message) : null }
  }

  const resetPasswordWithOtp = async (email: string, token: string, newPassword: string) => {
    if (!supabase) {
      return { error: 'Auth is not configured. See AUTH_SETUP.md' }
    }

    const { error } = await supabase.rpc('complete_recovery_with_otp', {
      p_email: email.trim().toLowerCase(),
      p_code: normalizeOtpInput(token),
      p_new_password: newPassword,
    })

    return { error: error ? mapAuthError(error.message) : null }
  }

  const signUp = async (email: string, password: string, username: string) => {
    if (!supabase) {
      return { error: 'Auth is not configured. See AUTH_SETUP.md' }
    }

    const normalized = normalizeUsername(username)
    if (!isValidUsername(normalized)) {
      return {
        error: 'Username must be 3–20 characters (letters, numbers, underscore only)',
      }
    }

    try {
      const { data: available, error: availError } = await supabase.rpc('is_username_available', {
        p_username: normalized,
      })

      if (!availError && available === false) {
        return { error: 'Username is already taken' }
      }

      if (availError) {
        const { data: taken } = await supabase
          .from('profiles')
          .select('id')
          .ilike('username', normalized)
          .maybeSingle()

        if (taken) {
          return { error: 'Username is already taken' }
        }
      }
    } catch (err) {
      console.warn('Username check failed (continuing signup)', err)
    }

    const normalizedEmail = email.trim().toLowerCase()
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: { username: normalized, phone: '' },
      },
    })

    // Confirm email OFF auto-creates a session — clear it until OTP is verified
    if (signUpData?.session || signUpData?.user) {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      setAdminVerified(null)
    }

    const userCreated = Boolean(signUpData?.user?.id)

    if (signUpError) {
      const canContinueToOtp =
        isIgnorableSignupEmailError(signUpError.message) ||
        isUserAlreadyRegisteredError(signUpError.message)

      if (!canContinueToOtp) {
        return { error: mapAuthError(signUpError.message) }
      }

      if (!userCreated && isIgnorableSignupEmailError(signUpError.message)) {
        const { data: exists } = await supabase.rpc('auth_user_exists', {
          p_email: normalizedEmail,
        })

        if (!exists) {
          return {
            error:
              'Could not create your account because Supabase failed to send its confirmation email. In Supabase go to Authentication → Providers → Email and turn OFF Confirm email, then try Sign Up again.',
          }
        }
      }
    }

    const { error: otpError } = await supabase.rpc('issue_email_otp', {
      p_email: normalizedEmail,
      p_purpose: 'signup',
    })

    if (otpError) {
      if (isEmailAlreadyVerifiedError(otpError.message)) {
        return { error: 'This email is already registered. Please sign in instead.' }
      }
      return { error: mapAuthError(otpError.message) }
    }

    return {
      error: null,
      email: normalizedEmail,
    }
  }

  const verifySignupOtp = async (email: string, token: string) => {
    if (!supabase) {
      return { error: 'Auth is not configured. See AUTH_SETUP.md' }
    }

    const { error } = await supabase.rpc('verify_signup_email_otp', {
      p_email: email.trim().toLowerCase(),
      p_code: normalizeOtpInput(token),
    })

    return { error: error ? mapAuthError(error.message) : null }
  }

  const resendSignupOtp = async (email: string) => {
    return issueEmailOtp(email, 'signup')
  }

  const signIn = async (identifier: string, password: string): Promise<SignInResult> => {
    if (!supabase) {
      return { error: 'Auth is not configured. See AUTH_SETUP.md', user: null }
    }

    try {
      return await withTimeout(
        (async () => {
          const email = await resolveLoginEmail(identifier)
          if (!email) {
            return { error: 'Invalid username or email', user: null, loginEmail: null }
          }
          return signInWithEmail(email, password)
        })(),
        20000,
        'Login timed out. Check your connection and try again.'
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed'
      return { error: mapAuthError(message), user: null, loginEmail: null }
    }
  }

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setAdminVerified(null)
  }

  const deleteAccount = async (username: string) => {
    if (!supabase) {
      return { error: 'Auth is not configured. See AUTH_SETUP.md' }
    }

    const { error } = await supabase.rpc('delete_my_account', {
      p_username: normalizeUsername(username),
    })

    if (error) {
      return { error: mapAuthError(error.message) }
    }

    await signOut()
    return { error: null }
  }

  const isAdmin =
    profile?.role === 'admin' || adminVerified === true || isAdminEmail(user?.email)

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        adminVerified,
        isConfigured: isSupabaseConfigured,
        signUp,
        verifySignupOtp,
        resendSignupOtp,
        signIn,
        signInWithEmail,
        resendConfirmationEmail,
        requestPasswordResetOtp,
        verifyRecoveryOtp,
        resetPasswordAfterRecovery,
        resetPasswordWithOtp,
        signOut,
        deleteAccount,
        refreshProfile,
        verifyAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
