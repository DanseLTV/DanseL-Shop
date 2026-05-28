import { Link, useLocation } from 'react-router-dom'
import { Store, Info, MessageCircle, User, LogIn, UserPlus } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export function MobileBottomNav() {
  const location = useLocation()
  const { user, loading } = useAuth()
  const path = location.pathname

  const hide =
    path.startsWith('/admin') ||
    path === '/login' ||
    path === '/signup' ||
    path === '/order'

  if (hide || loading) return null

  const items = user
    ? [
        { to: '/', label: 'Shop', icon: Store, match: (p: string) => p === '/' || p === '/shop' },
        {
          to: '/orders',
          label: 'Orders',
          icon: MessageCircle,
          match: (p: string) => p.startsWith('/orders'),
        },
        { to: '/account', label: 'Account', icon: User, match: (p: string) => p === '/account' },
        { to: '/home', label: 'About', icon: Info, match: (p: string) => p === '/home' },
      ]
    : [
        { to: '/', label: 'Shop', icon: Store, match: (p: string) => p === '/' || p === '/shop' },
        { to: '/home', label: 'About', icon: Info, match: (p: string) => p === '/home' },
        { to: '/login', label: 'Sign In', icon: LogIn, match: (p: string) => p === '/login' },
        { to: '/signup', label: 'Sign Up', icon: UserPlus, match: (p: string) => p === '/signup' },
      ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-midnight-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {items.map((item) => {
          const active = item.match(path)
          const Icon = item.icon
          return (
            <Link
              key={item.to + item.label}
              to={item.to}
              className={`flex flex-1 flex-col items-center gap-0.5 px-2 py-2.5 text-[10px] font-medium transition-colors ${
                active ? 'text-accent-violet' : 'text-white/50 hover:text-white/80'
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                  active ? 'bg-accent-violet/20' : ''
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
