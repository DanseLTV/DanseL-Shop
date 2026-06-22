import { motion } from 'framer-motion'
import { Info, ShoppingCart, Sparkles } from 'lucide-react'
import type { Product } from '../../types'
import { formatPrice } from '../../data/products'
import { ProductImage } from './ProductImage'

interface ProductCardProps {
  product: Product
  onViewDetails: (product: Product) => void
  onOrder: (product: Product) => void
  onAddToCart?: (product: Product) => void
  cartQuantity?: number
  index?: number
  /** Eager-load images (admin live preview) */
  priorityImage?: boolean
}

const availabilityStyles = {
  'In Stock': 'bg-status-success/15 text-status-success border-status-success/25',
  Limited: 'bg-status-warning/15 text-status-warning border-status-warning/25',
  'Out of Stock': 'bg-status-error/15 text-status-error border-status-error/25',
}

export function ProductCard({
  product,
  onViewDetails,
  onOrder,
  onAddToCart,
  cartQuantity = 0,
  index = 0,
  priorityImage = false,
}: ProductCardProps) {
  const isAvailable = product.availability !== 'Out of Stock'

  return (
    <motion.article
      whileHover={{ y: -3, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } }}
      className="glass-card-hover group relative flex min-w-0 flex-col overflow-hidden rounded-xl sm:rounded-2xl"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {product.badge && (
        <span className="neon-badge absolute right-1 top-1 z-10 flex max-w-[calc(100%-0.5rem)] items-center gap-0.5 truncate px-1.5 py-0.5 text-[8px] backdrop-blur-sm sm:right-1.5 sm:top-1.5 sm:text-[9px]">
          <Sparkles className="h-2 w-2 shrink-0 text-crown-light sm:h-2.5 sm:w-2.5" />
          <span className="truncate">{product.badge}</span>
        </span>
      )}

      <button
        type="button"
        onClick={() => onViewDetails(product)}
        className="relative block h-36 w-full sm:h-40 md:h-44 lg:h-48"
        aria-label={`View ${product.name} details`}
      >
        <ProductImage
          product={product}
          className="h-full w-full"
          priority={priorityImage}
        />
      </button>

      <div className="flex min-w-0 flex-col gap-1.5 p-2 sm:gap-2 sm:p-2.5 md:p-3">
        <div className="min-w-0">
          <p className="truncate text-[9px] font-semibold uppercase tracking-[0.1em] text-crown-silver sm:text-[10px]">
            {product.category}
          </p>
          <h3 className="mt-0.5 line-clamp-2 font-display text-xs font-semibold leading-tight text-white sm:text-sm lg:line-clamp-1">
            {product.name}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <span
            className={`rounded-full border px-2 py-0.5 text-[9px] font-medium sm:text-[10px] ${availabilityStyles[product.availability]}`}
          >
            {product.availability === 'In Stock' ? (
              <>
                <span className="sm:hidden">Stock</span>
                <span className="hidden sm:inline">{product.availability}</span>
              </>
            ) : (
              product.availability
            )}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] text-white/60 sm:text-[10px]">
            {product.duration}
          </span>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/5 pt-2 sm:pt-2.5">
          <p className="font-display text-base font-bold tabular-nums text-white sm:text-lg">
            {formatPrice(product.price)}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => onViewDetails(product)}
              className="btn-neon-ghost inline-flex min-w-0 items-center justify-center gap-1 px-2 py-2 text-[10px] leading-tight sm:gap-1.5 sm:px-2.5 sm:py-2 sm:text-xs"
            >
              <Info className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
              Details
            </button>
            {onAddToCart && (
              <button
                type="button"
                onClick={() => onAddToCart(product)}
                disabled={!isAvailable}
                className="btn-neon-accent inline-flex min-w-0 items-center justify-center gap-1 px-1.5 py-2 text-[9px] leading-tight disabled:cursor-not-allowed sm:gap-1.5 sm:px-2.5 sm:py-2 sm:text-xs"
              >
                <ShoppingCart className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
                <span className="truncate">
                  {cartQuantity > 0 ? `Add to Cart (${cartQuantity})` : 'Add to Cart'}
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onOrder(product)}
              disabled={!isAvailable}
              className={`btn-glow inline-flex min-w-0 items-center justify-center px-2 py-2 text-[10px] leading-tight disabled:cursor-not-allowed disabled:opacity-40 sm:px-3 sm:py-2 sm:text-xs ${
                onAddToCart ? 'col-span-2' : ''
              }`}
            >
              Buy
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
