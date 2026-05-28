import { useState } from 'react'
import type { Product } from '../../types'

interface ProductImageProps {
  product: Product
  className?: string
  overlay?: React.ReactNode
  size?: 'card' | 'modal' | 'hero'
}

export function ProductImage({
  product,
  className = '',
  overlay,
  size = 'card',
}: ProductImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [useFallback, setUseFallback] = useState(false)
  const src = product.image ?? `/products/${product.id}.svg`
  const isLogo = product.imageFit !== 'cover'

  const logoPadding =
    size === 'hero' ? 'p-10 sm:p-14' : size === 'modal' ? 'p-10' : 'p-6 sm:p-8'

  return (
    <div className={`group/img relative overflow-hidden ${className}`}>
      <div
        className={`absolute inset-0 bg-gradient-to-br ${product.imageGradient} transition-transform duration-700 group-hover/img:scale-105`}
      />
      {/* Soft light orbs */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-accent-cyan/10 blur-2xl" />

      {!useFallback && (
        <>
          {!loaded && (
            <div className="absolute inset-0 animate-pulse bg-white/5" />
          )}
          <img
            src={src}
            alt={`${product.name} logo`}
            className={`absolute inset-0 h-full w-full transition-all duration-500 ${
              isLogo
                ? `${logoPadding} object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)] group-hover/img:scale-105`
                : 'object-cover group-hover/img:scale-110'
            } ${loaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setLoaded(true)}
            onError={() => setUseFallback(true)}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
          />
        </>
      )}

      {useFallback && (
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <span className="font-display text-center text-2xl font-bold text-white drop-shadow-lg">
            {product.name}
          </span>
        </div>
      )}

      <div
        className={`absolute inset-0 ${
          isLogo ? 'bg-black/20' : 'bg-black/30'
        }`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-midnight-950/20 to-transparent opacity-80" />
      <div className="pointer-events-none absolute inset-0 bg-card-shine opacity-40" />
      {overlay}
    </div>
  )
}
