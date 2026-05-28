import { Link, useLocation } from 'react-router-dom'
import { MessageCircle, PackageSearch, Shield } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export function FloatingMessageButton() {
  const location = useLocation()
  const { user, isAdmin, loading } = useAuth()

  if (loading) return null
  if (location.pathname.startsWith('/admin')) return null
  if (location.pathname.startsWith('/orders')) return null
  if (location.pathname === '/login' || location.pathname === '/signup') return null

  const to = user ? '/orders' : '/login?redirect=%2Forders'

  return (
    <div className="fixed bottom-24 right-4 z-50 lg:bottom-6 lg:right-6">
      <div className="flex flex-col items-end gap-2">
        {user && (
          <Link
            to="/orders"
            className="hidden items-center gap-2 rounded-full border border-white/15 bg-midnight-900/90 px-3 py-1.5 text-xs text-white/70 shadow-glass backdrop-blur lg:inline-flex"
          >
            <PackageSearch className="h-3.5 w-3.5" />
            Orders & Transactions
          </Link>
        )}
        {user && isAdmin && (
          <Link
            to="/admin"
            className="hidden items-center gap-2 rounded-full border border-accent-violet/30 bg-accent-violet/15 px-3 py-1.5 text-xs text-accent-violet shadow-glow lg:inline-flex"
          >
            <Shield className="h-3.5 w-3.5" />
            Admin Inbox
          </Link>
        )}
        <Link
          to={to}
          className="group inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-accent-violet to-accent-purple text-white shadow-glow transition-transform hover:scale-105"
          aria-label="Open messages and transactions"
          title="Messages & Transactions"
        >
          <MessageCircle className="h-6 w-6" />
        </Link>
      </div>
    </div>
  )
}
