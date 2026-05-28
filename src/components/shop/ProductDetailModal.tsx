import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, ShoppingCart } from 'lucide-react'
import type { Product } from '../../types'
import { formatPrice } from '../../data/products'
import { ProductImage } from './ProductImage'
import { GradientButton } from '../ui/GradientButton'
interface ProductDetailModalProps {
  product: Product | null
  onClose: () => void
  onOrder: (product: Product) => void
}

export function ProductDetailModal({ product, onClose, onOrder }: ProductDetailModalProps) {
  if (!product) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="glass-card relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl sm:rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-20 rounded-full bg-black/40 p-2 text-white/90 backdrop-blur-sm transition-colors hover:bg-black/60"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <ProductImage product={product} className="h-56 sm:h-60" size="modal" />

          <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-accent-cyan">
                  {product.category}
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold text-white">
                  {product.name}
                </h2>
              </div>
              {product.badge && (
                <span className="rounded-full bg-accent-violet/20 px-3 py-1 text-xs font-bold text-accent-violet">
                  {product.badge}
                </span>
              )}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-white/70">{product.description}</p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-white/40">Price</p>
                <p className="font-display text-2xl font-bold text-white">
                  {formatPrice(product.price)}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-white/40">Duration</p>
                <p className="font-display text-xl font-bold text-white">{product.duration}</p>
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
                    <Check className="h-4 w-4 shrink-0 text-accent-cyan" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <GradientButton
                onClick={() => onOrder(product)}
                className="w-full"
                size="lg"
                disabled={product.availability === 'Out of Stock'}
              >
                <ShoppingCart className="h-4 w-4" />
                Order Now — {formatPrice(product.price)}
              </GradientButton>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
