import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, ShoppingCart } from 'lucide-react'
import type { Product } from '../../types'
import { formatPrice } from '../../data/products'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import { ProductImage } from './ProductImage'
import { GradientButton } from '../ui/GradientButton'

interface ProductDetailModalProps {
  product: Product | null
  onClose: () => void
  onOrder: (product: Product) => void
  onAddToCart?: (product: Product) => void
  cartQuantity?: number
}

export function ProductDetailModal({
  product,
  onClose,
  onOrder,
  onAddToCart,
  cartQuantity = 0,
}: ProductDetailModalProps) {
  const open = product !== null

  useBodyScrollLock(open)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end justify-center overscroll-none sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-detail-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            onClick={onClose}
            aria-label="Close product details"
          />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card relative z-[1] flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl sm:max-h-[90vh] sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-20 rounded-full border border-white/15 bg-white/10 p-2 text-white/90 backdrop-blur-sm transition-colors hover:bg-white/20"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="min-h-0 flex-1 scroll-y">
              <ProductImage product={product} className="h-56 shrink-0 sm:h-60" size="modal" />

              <div className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-eyebrow !text-[10px]">{product.category}</p>
                    <h2
                      id="product-detail-title"
                      className="mt-1.5 font-display text-2xl font-bold tracking-tight text-white"
                    >
                      {product.name}
                    </h2>
                  </div>
                  {product.badge && (
                    <span className="rounded-full bg-brand/20 px-3 py-1 text-xs font-bold text-brand">
                      {product.badge}
                    </span>
                  )}
                </div>

                <p className="text-body mt-4">{product.description}</p>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-price-label">Price</p>
                <p className="text-price">{formatPrice(product.price)}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-price-label">Duration</p>
                <p className="font-display text-xl font-bold tracking-tight text-white">{product.duration}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs ${
                      product.availability === 'In Stock'
                        ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400'
                        : product.availability === 'Limited'
                          ? 'border-amber-500/30 bg-amber-500/20 text-amber-400'
                          : 'border-red-500/30 bg-red-500/20 text-red-400'
                    }`}
                  >
                    {product.availability}
                  </span>
                </div>

                <div className="mt-6">
                  <p className="mb-3 text-sm font-semibold text-white">What&apos;s included</p>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {product.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-white/70">
                        <Check className="h-4 w-4 shrink-0 text-brand-bright" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 flex flex-col gap-3 pb-[env(safe-area-inset-bottom)]">
                  {onAddToCart && (
                    <GradientButton
                      onClick={() => onAddToCart(product)}
                      className="w-full"
                      size="lg"
                      variant="outline"
                      disabled={product.availability === 'Out of Stock'}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {cartQuantity > 0 ? `Add another (${cartQuantity} in cart)` : 'Add to cart'}
                    </GradientButton>
                  )}
                  <GradientButton
                    onClick={() => onOrder(product)}
                    className="w-full"
                    size="lg"
                    disabled={product.availability === 'Out of Stock'}
                  >
                    Buy now — {formatPrice(product.price)}
                  </GradientButton>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
