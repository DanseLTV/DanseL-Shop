import { useCallback, useEffect, useState } from 'react'
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Sparkles,
  Inbox,
  LogOut,
  Menu,
  X,
  Store,
  ExternalLink,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { consumeAdminWelcomeToast } from '../../constants/admin'
import { useLogoutConfirm } from '../../hooks/useLogoutConfirm'
import { LogoutConfirmModal } from '../auth/LogoutConfirmModal'
import { ToastBanner } from '../ui/ToastBanner'
import { NotificationBell } from '../notifications/NotificationBell'

const navItems = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders & Chat', icon: Inbox },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/landing-carousel', label: 'Landing Carousel', icon: Sparkles },
]

export function AdminLayout() {
  const { profile } = useAuth()
  const { logoutConfirmOpen, requestLogout, cancelLogout, confirmLogout } = useLogoutConfirm()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showWelcomeToast, setShowWelcomeToast] = useState(false)

  const dismissWelcomeToast = useCallback(() => setShowWelcomeToast(false), [])

  useEffect(() => {
    const fromLogin =
      (location.state as { adminWelcome?: boolean } | null)?.adminWelcome === true ||
      consumeAdminWelcomeToast()
    if (fromLogin) setShowWelcomeToast(true)
  }, [location.state])

  const closeMobile = () => setMobileOpen(false)

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium tracking-tight transition-colors ${
      isActive
        ? 'bg-brand/20 text-white'
        : 'text-ink-subtle hover:bg-white/5 hover:text-white'
    }`

  const sidebar = (
    <div className="flex h-full flex-col border-r border-white/10 bg-midnight-950">
      <div className="border-b border-white/10 px-4 py-4">
        <p className="font-display text-lg font-bold tracking-tight text-white">DANSEL Admin</p>
        <p className="text-caption mt-1 truncate">@{profile?.username ?? 'admin'}</p>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={navLinkClass}
            onClick={closeMobile}
          >
            <item.icon className="h-4 w-4 shrink-0 text-crown-silver" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-white/10 p-3">
        <Link
          to="/shop"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/55 hover:bg-white/5 hover:text-white"
          onClick={closeMobile}
        >
          <Store className="h-4 w-4" />
          View shop
          <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
        </Link>
        <button
          type="button"
          onClick={() => {
            closeMobile()
            requestLogout()
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/55 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  )

  const pageTitle =
    location.pathname === '/admin'
      ? 'Overview'
      : location.pathname.startsWith('/admin/orders')
        ? 'Orders & Chat'
        : location.pathname.includes('/products')
          ? 'Products'
          : location.pathname.includes('/landing-carousel') ||
              location.pathname.includes('/hero-carousel')
            ? 'Landing Carousel'
            : 'Admin'

  return (
    <div className="flex min-h-screen bg-[#070812] text-white">
      {showWelcomeToast && (
        <ToastBanner
          message={`Welcome back, Admin! Signed in as @${profile?.username ?? 'admin'}.`}
          variant="success"
          onDismiss={dismissWelcomeToast}
        />
      )}
      <LogoutConfirmModal
        open={logoutConfirmOpen}
        onCancel={cancelLogout}
        onConfirm={confirmLogout}
        placement="center"
      />
      <aside className="hidden w-56 shrink-0 lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:flex-col">
        {sidebar}
      </aside>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={closeMobile}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-56 transform transition-transform lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebar}
      </aside>

      <div className="flex min-h-screen flex-1 flex-col lg:pl-56">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-white/10 bg-midnight-950/95 px-4 backdrop-blur-md">
          <button
            type="button"
            className="rounded-lg border border-white/10 p-2 text-white/80 lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Open menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <h1 className="font-display text-base font-semibold text-white">{pageTitle}</h1>
          <div className="ml-auto">
            <NotificationBell />
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-x-hidden scroll-y">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
