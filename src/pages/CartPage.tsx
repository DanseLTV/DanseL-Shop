import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, ArrowRight, Store } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useProducts } from '../hooks/useProducts'
import { useCartCheckout } from '../hooks/useCartCheckout'
import { formatPrice } from '../data/products'
import { AnimatedBackground } from '../components/ui/AnimatedBackground'
import { CustomerPageHeader } from '../components/layout/CustomerPageHeader'
import { CartLineEditor } from '../components/cart/CartLineEditor'
import { EmptyState } from '../components/ui/EmptyState'
import { GradientButton } from '../components/ui/GradientButton'
import { ScrollReveal } from '../components/ui/ScrollReveal'

export function CartPage() {
  const { items, itemCount, lineCount } = useCart()
  const { products } = useProducts()
  const startCheckout = useCartCheckout()

  const resolved = useMemo(() => {
    return items
      .map((line) => {
        const product = products.find((p) => p.id === line.productId)
        if (!product) return null
        return { line, product }
      })
      .filter((row): row is NonNullable<typeof row> => row !== null)
  }, [items, products])

  const missingCount = items.length - resolved.length

  const subtotal = resolved.reduce((sum, { line, product }) => sum + product.price * line.quantity, 0)
  const hasUnavailable = resolved.some(({ product }) => product.availability === 'Out of Stock')
  const canCheckout = resolved.length > 0 && !hasUnavailable

  return (
    <div className="relative min-h-screen pt-20 pb-24 lg:pb-20">
      <AnimatedBackground />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <CustomerPageHeader
          backTo="/shop"
          backLabel="Continue shopping"
          badge="Cart"
          title="Your cart"
          subtitle={
            itemCount > 0
              ? `${itemCount} item${itemCount !== 1 ? 's' : ''} across ${lineCount} product${lineCount !== 1 ? 's' : ''}`
              : 'Add products from the shop, then checkout everything in one payment.'
          }
        />

        {items.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="h-7 w-7" />}
            title="Your cart is empty"
            description="Browse subscriptions and tap Add to cart on any product you want."
            actionLabel="Browse shop"
            actionTo="/shop"
          />
        ) : (
          <>
            {missingCount > 0 && (
              <p className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                {missingCount} item{missingCount !== 1 ? 's' : ''} in your cart no longer exist in the shop
                and will be skipped at checkout.
              </p>
            )}

            <div className="space-y-4">
              {resolved.map(({ line, product }) => (
                <ScrollReveal key={product.id}>
                  <CartLineEditor product={product} quantity={line.quantity} />
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={0.08}>
              <div className="glass-card mt-8 space-y-4 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-white/60">Subtotal ({itemCount} items)</span>
                  <span className="text-price text-2xl">{formatPrice(subtotal)}</span>
                </div>
                <p className="text-caption">
                  One payment proof covers all items. Each product becomes a separate order in My Orders
                  so you can chat with admin per item.
                </p>

                {hasUnavailable && (
                  <p className="rounded-lg border border-status-error/30 bg-status-error/10 px-3 py-2 text-sm text-red-200">
                    Remove out-of-stock items before checkout.
                  </p>
                )}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <GradientButton to="/shop" variant="outline" className="sm:flex-1">
                    <Store className="h-4 w-4" />
                    Add more products
                  </GradientButton>
                  <GradientButton
                    className="sm:flex-1"
                    size="lg"
                    disabled={!canCheckout}
                    onClick={startCheckout}
                  >
                    Proceed to checkout
                    <ArrowRight className="h-4 w-4" />
                  </GradientButton>
                </div>

                <p className="text-center text-xs text-white/35">
                  Prefer one item only? Use <strong className="text-white/55">Buy now</strong> on any
                  product card instead.
                </p>
              </div>
            </ScrollReveal>
          </>
        )}

        {items.length > 0 && (
          <p className="text-caption mt-8 text-center">
            Need help? See{' '}
            <Link to="/policies" className="text-brand hover:underline">
              policies
            </Link>{' '}
            or message admin after ordering.
          </p>
        )}
      </div>
    </div>
  )
}
