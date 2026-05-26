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
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="glass-card relative max-h-[90vh] w-full max-w-lg overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <ProductImage
            product={product}
            className="h-52"
            overlay={
              <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                {product.badge && (
                  <span className="mb-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-sm">
                    {product.badge}
                  </span>
                )}
                <h2 className="font-display text-3xl font-bold text-white drop-shadow-lg">
                  {product.name}
                </h2>
                <p className="mt-1 text-sm text-white/80">{product.category}</p>
              </div>
            }
          />

          <div className="p-6">
            <p className="text-sm leading-relaxed text-white/70">{product.description}</p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-white/40">Price</p>
                <p className="font-display text-2xl font-bold text-white">
                  {formatPrice(product.price)}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-white/40">Duration</p>
                <p className="font-display text-xl font-bold text-white">
                  {product.duration}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <p className="mb-3 text-sm font-semibold text-white">What's included</p>
              <ul className="space-y-2">
                {product.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-white/70">
                    <Check className="h-4 w-4 shrink-0 text-accent-cyan" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex gap-3">
              <GradientButton
                onClick={() => onOrder(product)}
                className="flex-1"
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
