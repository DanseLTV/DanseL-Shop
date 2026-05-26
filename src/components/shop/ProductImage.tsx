import { useState } from 'react'
import type { Product } from '../../types'

interface ProductImageProps {
  product: Product
  className?: string
  overlay?: React.ReactNode
}

export function ProductImage({ product, className = '', overlay }: ProductImageProps) {
  const [useFallback, setUseFallback] = useState(false)
  const src = product.image ?? `/products/${product.id}.svg`

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        className={`absolute inset-0 bg-gradient-to-br ${product.imageGradient} transition-transform duration-500 group-hover:scale-110`}
      />
      {!useFallback && (
        <img
          src={src}
          alt={product.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={() => setUseFallback(true)}
          loading="lazy"
        />
      )}
      <div className="absolute inset-0 bg-black/25" />
      {overlay}
      <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-transparent to-transparent opacity-70" />
    </div>
  )
}
