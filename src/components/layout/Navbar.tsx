import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ShoppingBag, User, LogOut, Shield } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'Reviews', to: '/#reviews' },
  { label: 'FAQ', to: '/#faq' },
  { label: 'Policies', to: '/policies' },
  { label: 'Contact', to: '/#contact' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { user, profile, signOut, isAdmin } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const handleHashLink = (to: string) => {
    if (to.startsWith('/#')) {
      const id = to.replace('/#', '')
      if (location.pathname === '/') {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-white/10 bg-midnight-950/80 backdrop-blur-xl'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-violet to-accent-cyan shadow-glow">
            <span className="font-display text-sm font-bold text-white">D</span>
          </div>
          <span className="font-display text-lg font-bold tracking-wider text-white group-hover:text-accent-violet transition-colors">
            DANSEL <span className="gradient-text">SHOP</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) =>
            link.to.startsWith('/#') ? (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => handleHashLink(link.to)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </Link>
            ) : (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-white/5 hover:text-white ${
                  location.pathname === link.to ? 'text-white' : 'text-white/70'
                }`}
              >
                {link.label}
              </Link>
            )
          )}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              <Link
                to="/account"
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 transition-colors hover:border-accent-violet/40"
              >
                <User className="h-4 w-4" />
                {profile?.username ?? 'Account'}
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-accent-violet hover:bg-white/5"
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              )}
              <button
                type="button"
                onClick={() => signOut()}
                className="rounded-lg p-2 text-white/50 hover:bg-white/5 hover:text-white"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-outline px-4 py-2 text-sm">
                Sign In
              </Link>
              <Link to="/signup" className="btn-glow px-4 py-2 text-sm">
                Sign Up
              </Link>
            </>
          )}
          <Link
            to="/shop"
            className="btn-glow inline-flex items-center gap-2 px-4 py-2 text-sm"
          >
            <ShoppingBag className="h-4 w-4" />
            Shop
          </Link>
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
            className="border-b border-white/10 bg-midnight-950/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => handleHashLink(link.to)}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link to="/account" className="rounded-lg px-4 py-3 text-sm text-white/80">
                    My Account
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="rounded-lg px-4 py-3 text-sm text-accent-violet">
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="rounded-lg px-4 py-3 text-left text-sm text-white/60"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="rounded-lg px-4 py-3 text-sm text-white/80">
                    Sign In
                  </Link>
                  <Link to="/signup" className="btn-glow mt-1 py-3 text-center text-sm">
                    Sign Up
                  </Link>
                </>
              )}
              <Link
                to="/shop"
                className="btn-glow mt-2 flex items-center justify-center gap-2 py-3 text-sm"
              >
                <ShoppingBag className="h-4 w-4" />
                Shop Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
