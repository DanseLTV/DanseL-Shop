import { GradientButton } from '../ui/GradientButton'
import { useOrderNavigation } from '../../hooks/useOrderNavigation'

interface OrderButtonProps {
  productId?: string
  variant?: 'primary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  children: React.ReactNode
}

/** Order CTA — redirects to login if not signed in */
export function OrderButton({
  productId,
  variant = 'primary',
  size = 'md',
  className,
  children,
}: OrderButtonProps) {
  const goToOrder = useOrderNavigation()

  return (
    <GradientButton
      onClick={() => goToOrder(productId)}
      variant={variant}
      size={size}
      className={className}
    >
      {children}
    </GradientButton>
  )
}
