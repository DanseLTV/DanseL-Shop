import { Minus, Plus, Trash2 } from 'lucide-react'
import type { Product } from '../../types'
import { formatPrice } from '../../data/products'
import { ProductImage } from '../shop/ProductImage'
import { useCart } from '../../context/CartContext'

interface CartLineEditorProps {
  product: Product
  quantity: number
  compact?: boolean
}

export function CartLineEditor({ product, quantity, compact = false }: CartLineEditorProps) {
  const { setQuantity, removeItem } = useCart()
  const lineTotal = product.price * quantity
  const unavailable = product.availability === 'Out of Stock'

  return (
    <div
      className={`flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] ${
        compact ? 'p-3' : 'p-4 sm:p-5'
      } ${unavailable ? 'opacity-60' : ''}`}
    >
      <div className={`shrink-0 overflow-hidden rounded-xl ${compact ? 'h-16 w-16' : 'h-20 w-20 sm:h-24 sm:w-24'}`}>
        <ProductImage product={product} className="h-full w-full" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-eyebrow !text-[10px]">{product.category}</p>
            <h3 className="font-display text-base font-semibold tracking-tight text-white sm:text-lg">
              {product.name}
            </h3>
            <p className="text-caption mt-1">
              {formatPrice(product.price)} / {product.duration}
            </p>
            {unavailable && (
              <p className="mt-1 text-xs font-medium text-status-error">Out of stock — remove to checkout</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => removeItem(product.id)}
            className="shrink-0 rounded-lg p-2 text-white/40 transition-colors hover:bg-red-500/10 hover:text-red-300"
            aria-label={`Remove ${product.name} from cart`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
          <div className="flex items-center rounded-xl border border-white/10 bg-white/5">
            <button
              type="button"
              onClick={() => setQuantity(product.id, quantity - 1)}
              className="rounded-l-xl p-2.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
              aria-label="Decrease quantity"
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-[2.5rem] px-2 text-center text-sm font-semibold text-white">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(product.id, quantity + 1)}
              className="rounded-r-xl p-2.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <p className="text-price text-lg">{formatPrice(lineTotal)}</p>
        </div>
      </div>
    </div>
  )
}
