import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
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
    <motion.article
      whileHover={{ y: -6, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } }}
      className="glass-card-hover group relative flex flex-col overflow-hidden"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {product.badge && (
        <span className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-gradient-to-r from-accent-violet to-accent-cyan px-3 py-1 text-xs font-bold text-white shadow-glow">
          <Sparkles className="h-3 w-3" />
          {product.badge}
        </span>
      )}

      <button
        type="button"
        onClick={() => onViewDetails(product)}
        className="relative block h-52 w-full sm:h-56"
        aria-label={`View ${product.name} details`}
      >
        <ProductImage
          product={product}
          className="h-full w-full"
          overlay={
            <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="rounded-full border border-white/20 bg-black/40 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                Tap for details
              </span>
            </div>
          }
        />
      </button>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent-cyan">
          {product.category}
        </p>
        <h3 className="mt-1 font-display text-lg font-semibold leading-snug text-white">
          {product.name}
        </h3>

        <p className="mb-4 mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-white/50">
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

        <div className="flex items-end justify-between gap-3 border-t border-white/5 pt-4">
          <div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">
              From
            </span>
            <p className="font-display text-2xl font-bold text-white">
              {formatPrice(product.price)}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => onViewDetails(product)}
              className="rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-xs font-medium text-white/80 transition-all hover:border-accent-violet/40 hover:bg-white/10"
            >
              Details
            </button>
            <button
              type="button"
              onClick={() => onOrder(product)}
              disabled={!isAvailable}
              className="rounded-xl bg-gradient-to-r from-accent-violet to-accent-purple px-4 py-2.5 text-xs font-semibold text-white shadow-glow transition-all hover:shadow-[0_6px_28px_rgba(139,92,246,0.45)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Order
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
