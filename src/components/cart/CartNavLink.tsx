import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '../../context/CartContext'

interface CartNavLinkProps {
  className?: string
  iconClassName?: string
  showLabel?: boolean
}

export function CartNavLink({
  className = '',
  iconClassName = 'h-5 w-5',
  showLabel = false,
}: CartNavLinkProps) {
  const { itemCount } = useCart()

  return (
    <Link
      to="/cart"
      className={`relative inline-flex items-center gap-2 ${className}`}
      aria-label={itemCount > 0 ? `Cart, ${itemCount} items` : 'Cart'}
    >
      <ShoppingCart className={iconClassName} />
      {showLabel && <span>Cart</span>}
      {itemCount > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-br from-neon-cyan to-neon-magenta px-1 text-[10px] font-bold text-midnight-950 shadow-neon-cyan">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  )
}
