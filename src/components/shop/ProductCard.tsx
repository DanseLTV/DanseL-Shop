import { motion } from 'framer-motion'
import type { Product } from '../../types'
import { formatPrice } from '../../data/products'
import { ProductImage } from './ProductImage'

interface ProductCardProps {
  product: Product
  onViewDetails: (product: Product) => void
  onOrder: (product: Product) => void
  index?: number
}

const availabilityStyles = {
  'In Stock': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Limited: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Out of Stock': 'bg-red-500/20 text-red-400 border-red-500/30',
}

export function ProductCard({ product, onViewDetails, onOrder, index = 0 }: ProductCardProps) {
  const isAvailable = product.availability !== 'Out of Stock'

  return (
    <motion.div
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="glass-card-hover group relative flex flex-col overflow-hidden"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {product.badge && (
        <span className="absolute right-3 top-3 z-10 rounded-full bg-gradient-to-r from-accent-violet to-accent-cyan px-3 py-1 text-xs font-bold text-white shadow-glow">
          {product.badge}
        </span>
      )}

      <button
        type="button"
        onClick={() => onViewDetails(product)}
        className="relative block h-44 w-full"
      >
        <ProductImage
          product={product}
          className="h-full w-full"
          overlay={
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-xl font-bold text-white drop-shadow-lg opacity-0 transition-opacity group-hover:opacity-100">
                View details
              </span>
            </div>
          }
        />
      </button>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-accent-violet">
              {product.category}
            </p>
            <h3 className="mt-1 font-display text-lg font-semibold text-white">
              {product.name}
            </h3>
          </div>
        </div>

        <p className="mb-4 line-clamp-2 flex-1 text-sm text-white/50">
          {product.description}
        </p>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${availabilityStyles[product.availability]}`}
          >
            {product.availability}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-white/60">
            {product.duration}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-xs text-white/40">Starting at</span>
            <p className="font-display text-2xl font-bold text-white">
              {formatPrice(product.price)}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onViewDetails(product)}
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 transition-all hover:border-accent-violet/40 hover:bg-white/10"
            >
              Details
            </button>
            <button
              type="button"
              onClick={() => onOrder(product)}
              disabled={!isAvailable}
              className="rounded-lg bg-gradient-to-r from-accent-violet to-accent-purple px-4 py-2 text-xs font-semibold text-white transition-all hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-40"
            >
              Order
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
