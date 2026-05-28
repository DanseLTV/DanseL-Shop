import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { User } from '@supabase/supabase-js'
import {
  supabase,
  isSupabaseConfigured,
  type UserProfile,
} from '../lib/supabase'
import { checkIsAdminUid } from '../lib/adminCheck'
import { isValidUsername, normalizeUsername } from '../utils/authHelpers'
import { mapAuthError } from '../utils/authErrors'

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
  resetPasswordWithOtp: (
    email: string,
    token: string,
    newPassword: string
  ) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
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
    full_name: row.full_name as string | undefined,
  }
}

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, email, full_name, phone, role, created_at')
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

async function resolveLoginEmail(identifier: string): Promise<string | null> {
  if (!supabase) return null
  const trimmed = identifier.trim()
  if (!trimmed) return null

  if (trimmed.includes('@')) {
    return trimmed.toLowerCase()
  }

  try {
    const { data, error } = await supabase.rpc('get_login_email', {
      identifier: trimmed,
    })

    if (error || !data) return null
    return data as string
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [adminVerified, setAdminVerified] = useState<boolean | null>(null)

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
        const { data: { session } } = await supabase!.auth.getSession()
        if (cancelled) return
        const sessionUser = session?.user ?? null
        setUser(sessionUser)
        if (sessionUser) {
          const p = await fetchProfile(sessionUser.id)
          if (!cancelled) setProfile(p)
          if (!cancelled && p?.role === 'admin') {
            setAdminVerified(true)
          } else if (!cancelled) {
            const isAdm = await checkIsAdminUid(sessionUser.id)
            if (!cancelled) setAdminVerified(isAdm.isAdmin)
          }
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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (cancelled) return
      const sessionUser = session?.user ?? null
      setUser(sessionUser)
      if (sessionUser) {
        const p = await fetchProfile(sessionUser.id)
        if (!cancelled) setProfile(p)
        if (!cancelled && p?.role === 'admin') {
          setAdminVerified(true)
        } else if (!cancelled) {
          const isAdm = await checkIsAdminUid(sessionUser.id)
          if (!cancelled) setAdminVerified(isAdm.isAdmin)
        }
      } else {
        setProfile(null)
        setAdminVerified(null)
      }
      if (!cancelled) {
        clearTimeout(safety)
        setLoading(false)
      }
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

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (error) {
      return {
        error: mapAuthError(error.message),
        user: null,
        loginEmail: email.trim().toLowerCase(),
      }
    }

    const sessionUser = data.user ?? data.session?.user ?? null
    if (sessionUser) setUser(sessionUser)

    return { error: null, user: sessionUser, loginEmail: email.trim().toLowerCase() }
  }

  const resendConfirmationEmail = async (email: string) => {
    if (!supabase) {
      return { error: 'Auth is not configured. See AUTH_SETUP.md' }
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
    })

    return { error: error ? mapAuthError(error.message) : null }
  }

  const requestPasswordResetOtp = async (email: string) => {
    if (!supabase) {
      return { error: 'Auth is not configured. See AUTH_SETUP.md' }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase())
    return { error: error ? mapAuthError(error.message) : null }
  }

  const resetPasswordWithOtp = async (email: string, token: string, newPassword: string) => {
    if (!supabase) {
      return { error: 'Auth is not configured. See AUTH_SETUP.md' }
    }

    const normalizedEmail = email.trim().toLowerCase()
    const normalizedToken = token.trim()

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: normalizedEmail,
      token: normalizedToken,
      type: 'recovery',
    })

    if (verifyError) {
      return { error: mapAuthError(verifyError.message) }
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })
    return { error: updateError ? mapAuthError(updateError.message) : null }
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
      const { data: taken } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', normalized)
        .maybeSingle()

      if (taken) {
        return { error: 'Username is already taken' }
      }
    } catch (err) {
      console.warn('Username check failed (continuing signup)', err)
    }

    const normalizedEmail = email.trim().toLowerCase()
    const { error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: { username: normalized, phone: '' },
      },
    })

    return { error: error ? mapAuthError(error.message) : null, email: normalizedEmail }
  }

  const verifySignupOtp = async (email: string, token: string) => {
    if (!supabase) {
      return { error: 'Auth is not configured. See AUTH_SETUP.md' }
    }

    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: token.trim(),
      type: 'signup',
    })

    return { error: error ? mapAuthError(error.message) : null }
  }

  const resendSignupOtp = async (email: string) => {
    if (!supabase) {
      return { error: 'Auth is not configured. See AUTH_SETUP.md' }
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
    })

    return { error: error ? mapAuthError(error.message) : null }
  }

  const signIn = async (identifier: string, password: string): Promise<SignInResult> => {
    if (!supabase) {
      return { error: 'Auth is not configured. See AUTH_SETUP.md', user: null }
    }

    const email = await resolveLoginEmail(identifier)
    if (!email) {
      return { error: 'Invalid username or email', user: null, loginEmail: null }
    }

    return signInWithEmail(email, password)
  }

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setAdminVerified(null)
  }

  const isAdmin = profile?.role === 'admin' || adminVerified === true

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
        resetPasswordWithOtp,
        signOut,
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
