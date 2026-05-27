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
import { isValidUsername, normalizeUsername } from '../utils/authHelpers'

interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  isAdmin: boolean
  isConfigured: boolean
  signUp: (
    email: string,
    password: string,
    username: string
  ) => Promise<{ error: string | null }>
  signIn: (identifier: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
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
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, email, full_name, phone, role, created_at')
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return mapProfile(data as Record<string, unknown>)
}

async function resolveLoginEmail(identifier: string): Promise<string | null> {
  if (!supabase) return null
  const trimmed = identifier.trim()
  if (!trimmed) return null

  if (trimmed.includes('@')) {
    return trimmed.toLowerCase()
  }

  const { data, error } = await supabase.rpc('get_login_email', {
    identifier: trimmed,
  })

  if (error || !data) return null
  return data as string
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null)
      return
    }
    const p = await fetchProfile(user.id)
    setProfile(p)
  }, [user])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id).then(setProfile)
      }
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const p = await fetchProfile(session.user.id)
        setProfile(p)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

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

    const { data: taken } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', normalized)
      .maybeSingle()

    if (taken) {
      return { error: 'Username is already taken' }
    }

    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { username: normalized, phone: '' },
      },
    })

    return { error: error?.message ?? null }
  }

  const signIn = async (identifier: string, password: string) => {
    if (!supabase) {
      return { error: 'Auth is not configured. See AUTH_SETUP.md' }
    }

    const email = await resolveLoginEmail(identifier)
    if (!email) {
      return { error: 'Invalid username or email' }
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin: profile?.role === 'admin',
        isConfigured: isSupabaseConfigured,
        signUp,
        signIn,
        signOut,
        refreshProfile,
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
