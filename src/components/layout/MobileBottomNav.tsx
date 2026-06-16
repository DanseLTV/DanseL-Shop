import { Link, useLocation } from 'react-router-dom'
import { Store, Info, MessageCircle, User, LogIn, UserPlus, ShoppingCart } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

export function MobileBottomNav() {
  const location = useLocation()
  const { user, loading } = useAuth()
  const { itemCount } = useCart()
  const path = location.pathname

  const hide =
    path.startsWith('/admin') ||
    path === '/login' ||
    path === '/signup' ||
    path === '/order'

  if (hide || loading) return null

  const cartItem = {
    to: '/cart',
    label: 'Cart',
    icon: ShoppingCart,
    match: (p: string) => p === '/cart',
    badge: itemCount,
  }

  const items = user
    ? [
        { to: '/shop', label: 'Home', icon: Store, match: (p: string) => p === '/shop' },
        cartItem,
        { to: '/home', label: 'About', icon: Info, match: (p: string) => p === '/home' },
        {
          to: '/orders',
          label: 'Orders',
          icon: MessageCircle,
          match: (p: string) => p.startsWith('/orders'),
        },
        { to: '/account', label: 'Account', icon: User, match: (p: string) => p === '/account' },
      ]
    : [
        { to: '/shop', label: 'Home', icon: Store, match: (p: string) => p === '/shop' },
        cartItem,
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
          const badge = 'badge' in item ? item.badge : 0
          return (
            <Link
              key={item.to + item.label}
              to={item.to}
              className={`relative flex flex-1 flex-col items-center gap-0.5 px-1 py-2.5 text-[10px] font-medium transition-colors ${
                active ? 'text-neon-cyan' : 'text-white/50 hover:text-white/80'
              }`}
            >
              <span
                className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                  active
                    ? 'bg-neon-cyan/15 shadow-neon-cyan ring-1 ring-neon-cyan/40'
                    : 'hover:bg-neon-cyan/5'
                }`}
              >
                <Icon className="h-5 w-5" />
                {badge > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-br from-neon-cyan to-neon-magenta px-1 text-[9px] font-bold text-midnight-950 shadow-neon-cyan">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </span>
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
