import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

interface AdminRouteProps {
  children: React.ReactNode
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading, isAdmin, verifyAdmin } = useAuth()
  const location = useLocation()
  const [checking, setChecking] = useState(true)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      if (loading) return
      if (!user) {
        setAllowed(false)
        setChecking(false)
        return
      }
      if (isAdmin) {
        setAllowed(true)
        setChecking(false)
        return
      }
      const ok = await verifyAdmin(user.id)
      if (!cancelled) {
        setAllowed(ok)
        setChecking(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [loading, user, isAdmin, verifyAdmin])

  if (loading || checking) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent-violet border-t-transparent" />
        <p className="text-sm text-white/50">Checking admin access…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />
  }

  if (!allowed) {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}
