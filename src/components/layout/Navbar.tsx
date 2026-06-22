import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User, LogOut, Shield, LogIn, UserPlus, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLogoutConfirm } from '../../hooks/useLogoutConfirm'
import { LogoutConfirmModal } from '../auth/LogoutConfirmModal'
import { CartNavLink } from '../cart/CartNavLink'
import { LANDING_PREVIEW_PATH } from '../../constants/landing'
import { NotificationBell } from '../notifications/NotificationBell'
import { BrandName } from '../ui/BrandName'

const navLinks = [
  { label: 'Home', to: '/shop', exact: true },
  { label: 'About', to: '/home', exact: true },
  { label: 'Policies', to: '/policies', exact: true },
]

function isLinkActive(pathname: string, link: (typeof navLinks)[number]) {
  if (link.exact) return pathname === link.to
  return pathname.startsWith(link.to)
}

/** Cart nav only on shop browsing / checkout — not auth or info pages. */
function showShopCartNav(pathname: string) {
  return pathname === '/shop' || pathname === '/cart' || pathname === '/order'
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { user, profile, isAdmin, loading } = useAuth()
  const { logoutConfirmOpen, requestLogout, cancelLogout, confirmLogout } = useLogoutConfirm()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const linkClass = (active: boolean) =>
    `relative rounded-lg px-3 py-2 text-sm font-medium tracking-tight transition-colors ${
      active
        ? 'text-white'
        : 'text-ink-muted hover:bg-white/5 hover:text-white'
    }`

  const onLoginPage = location.pathname === '/login'
  const onSignupPage = location.pathname === '/signup'
  const onForgotPasswordPage = location.pathname === '/forgot-password'
  const showCartNav = showShopCartNav(location.pathname)

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-white/10 bg-midnight-950/90 backdrop-blur-xl shadow-glass'
          : 'bg-midnight-950/40 backdrop-blur-md'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <Link to="/shop" className="group flex items-center gap-2">
          <img
            src="/shop-logo.png"
            alt="Dansel Shop logo"
            className="h-10 w-10 rounded-xl border border-amber-200/20 object-cover shadow-[0_0_16px_rgba(255,196,90,0.15)]"
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).style.display = 'none'
            }}
          />
          <BrandName className="font-display text-lg font-bold tracking-wider transition-[filter] group-hover:brightness-110" />
        </Link>

        <div className="hidden items-center gap-0.5 lg:flex">
          {navLinks.map((link) => {
            const active = isLinkActive(location.pathname, link)
            return (
              <Link key={link.to} to={link.to} className={linkClass(active)}>
                {link.label}
                {active && (
                  <span className="absolute bottom-0.5 left-3 right-3 h-0.5 rounded-full bg-gradient-to-r from-amber-200/70 to-amber-400/90" />
                )}
              </Link>
            )
          })}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          {isAdmin && location.pathname !== '/' && (
            <Link
              to={LANDING_PREVIEW_PATH}
              className={`${linkClass(false)} inline-flex items-center gap-1.5`}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-200/80" />
              Landing
            </Link>
          )}
          {showCartNav && (
            <CartNavLink
              className={`rounded-lg px-3 py-2 text-sm font-medium tracking-tight transition-colors ${
                location.pathname === '/cart'
                  ? 'text-amber-200'
                  : 'text-ink-muted hover:bg-white/5 hover:text-white'
              }`}
              showLabel
            />
          )}
          {loading ? (
            <div className="h-9 w-28 animate-pulse rounded-lg bg-white/10" />
          ) : user ? (
            <>
              <NotificationBell />
              <Link
                to="/orders"
                className={`${linkClass(location.pathname.startsWith('/orders'))} ${
                  location.pathname.startsWith('/orders') ? 'text-amber-200' : ''
                }`}
              >
                My Orders
              </Link>
              <Link
                to="/account"
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 transition-colors hover:border-amber-200/35"
              >
                <User className="h-4 w-4 text-amber-200/90" />
                @{profile?.username ?? 'account'}
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-amber-200/90 hover:bg-white/5"
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              )}
              <button
                type="button"
                onClick={requestLogout}
                className="rounded-lg p-2 text-white/50 hover:bg-white/5 hover:text-white"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              {!onLoginPage && !onForgotPasswordPage && (
                <Link
                  to="/login"
                  className="btn-royal-gold inline-flex items-center justify-center gap-2 px-4 py-2 text-sm"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
              )}
              {!onSignupPage && (
                <Link
                  to="/signup"
                  className="btn-royal-gold inline-flex items-center justify-center gap-2 px-4 py-2 text-sm"
                >
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </Link>
              )}
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-white/80 hover:bg-white/10 lg:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-white/10 bg-midnight-950/98 backdrop-blur-xl lg:hidden"
          >
            <div className="flex max-h-[70vh] flex-col gap-1 scroll-y px-4 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rounded-lg px-4 py-3 text-sm font-medium ${
                    isLinkActive(location.pathname, link)
                      ? 'bg-amber-400/10 text-amber-100'
                      : 'text-white/80 hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="my-2 border-t border-white/10" />
              {showCartNav && (
                <Link
                  to="/cart"
                  className={`rounded-lg px-4 py-3 text-sm font-medium ${
                    location.pathname === '/cart'
                      ? 'bg-amber-400/10 text-amber-100'
                      : 'text-white/80 hover:bg-white/5'
                  }`}
                >
                  Cart
                </Link>
              )}
              {isAdmin && location.pathname !== '/' && (
                <Link
                  to={LANDING_PREVIEW_PATH}
                  className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/5"
                >
                  <Sparkles className="h-4 w-4 text-amber-200/80" />
                  Landing page
                </Link>
              )}
              {loading ? null : user ? (
                <>
                  <div className="flex items-center justify-between rounded-lg px-4 py-2">
                    <span className="text-sm text-white/60">Notifications</span>
                    <NotificationBell />
                  </div>
                  <Link to="/orders" className="rounded-lg px-4 py-3 text-sm text-white/80">
                    My Orders & Messages
                  </Link>
                  <Link to="/account" className="rounded-lg px-4 py-3 text-sm text-white/80">
                    Account (@{profile?.username ?? 'account'})
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="rounded-lg px-4 py-3 text-sm text-amber-200/90">
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false)
                      requestLogout()
                    }}
                    className="rounded-lg px-4 py-3 text-left text-sm text-white/60"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  {!onLoginPage && !onForgotPasswordPage && (
                    <Link
                      to="/login"
                      className="btn-royal-gold flex items-center justify-center gap-2 px-4 py-3 text-sm"
                    >
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </Link>
                  )}
                  {!onSignupPage && (
                    <Link
                      to="/signup"
                      className="btn-royal-gold flex items-center justify-center gap-2 px-4 py-3 text-sm"
                    >
                      <UserPlus className="h-4 w-4" />
                      Sign Up
                    </Link>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <LogoutConfirmModal
        open={logoutConfirmOpen}
        onCancel={cancelLogout}
        onConfirm={confirmLogout}
      />
    </motion.header>
  )
}
