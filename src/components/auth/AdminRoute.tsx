import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { isAdminEmail } from '../../constants/admin'

interface AdminRouteProps {
  children: React.ReactNode
}

const CHECK_TIMEOUT_MS = 8000

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, profile, loading, isAdmin, verifyAdmin } = useAuth()
  const location = useLocation()
  const [checking, setChecking] = useState(true)
  const [allowed, setAllowed] = useState(false)
  const [checkError, setCheckError] = useState('')

  const pendingRef = useRef(true)

  useEffect(() => {
    let cancelled = false
    pendingRef.current = true

    const finish = (ok: boolean, error = '') => {
      if (cancelled) return
      pendingRef.current = false
      setAllowed(ok)
      setCheckError(error)
      setChecking(false)
    }

    const watchdog = setTimeout(() => {
      if (!cancelled && pendingRef.current) {
        finish(
          false,
          'Admin access check timed out. Try signing in again, or confirm your account has role = admin in Supabase.'
        )
      }
    }, CHECK_TIMEOUT_MS + 2000)

    const run = async () => {
      if (loading) return

      if (!user) {
        finish(false)
        return
      }

      if (isAdminEmail(user.email) || profile?.role === 'admin' || isAdmin) {
        finish(true)
        return
      }

      try {
        const ok = await Promise.race([
          verifyAdmin(user.id),
          new Promise<boolean>((resolve) => {
            setTimeout(() => resolve(false), CHECK_TIMEOUT_MS)
          }),
        ])
        if (ok) {
          finish(true)
        } else {
          finish(
            false,
            'This account is not an admin. In Supabase SQL Editor run: update public.profiles set role = \'admin\' where id = (select id from auth.users where email = \'your@email.com\');'
          )
        }
      } catch (err) {
        finish(
          false,
          err instanceof Error ? err.message : 'Could not verify admin access.'
        )
      }
    }

    setChecking(true)
    setCheckError('')
    void run()

    return () => {
      cancelled = true
      clearTimeout(watchdog)
    }
  }, [loading, user, profile?.role, isAdmin, verifyAdmin])

  if (loading || checking) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent-violet border-t-transparent" />
        <p className="text-sm text-white/50">Checking admin access…</p>
      </div>
    )
  }

  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }

  if (!allowed) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {checkError || 'Admin access denied for this account.'}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to={`/login?redirect=${encodeURIComponent('/admin')}`}
            className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-midnight-950 hover:bg-brand-bright"
          >
            Sign in
          </Link>
          <Link
            to="/account"
            className="rounded-xl border border-white/20 px-5 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10"
          >
            My account
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
