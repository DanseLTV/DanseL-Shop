import { useState } from 'react'
import type { Product } from '../../types'
import { isLocalProductImage } from '../../data/productImages'

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
  const primarySrc = product.image ?? `/products/${product.id}.svg`
  const [src, setSrc] = useState(primarySrc)
  const [loaded, setLoaded] = useState(isLocalProductImage(primarySrc))
  const isLocal = isLocalProductImage(src)
  const isCover = product.imageFit === 'cover' || isLocal

  const fallbackSvg = `/products/${product.id}.svg`

  const handleError = () => {
    if (src !== fallbackSvg) {
      setSrc(fallbackSvg)
      setLoaded(isLocalProductImage(fallbackSvg))
      return
    }
    setLoaded(true)
  }

  return (
    <div className={`group/img relative overflow-hidden bg-midnight-900 ${className}`}>
      {/* Subtle backdrop only when using small logo mode */}
      {!isCover && (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${product.imageGradient}`}
        />
      )}

      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-white/5" />
      )}

      <img
        key={src}
        src={src}
        alt={product.name}
        className={`absolute inset-0 h-full w-full transition-opacity duration-300 ${
          isCover
            ? 'object-cover group-hover/img:scale-105'
            : 'object-contain p-8 drop-shadow-lg group-hover/img:scale-105'
        } ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={handleError}
        loading={size === 'card' ? 'lazy' : 'eager'}
        decoding="async"
      />

      {/* Bottom fade for text readability on cards */}
      <div
        className={`pointer-events-none absolute inset-0 ${
          isCover
            ? 'bg-gradient-to-t from-midnight-950/90 via-midnight-950/20 to-transparent'
            : 'bg-gradient-to-t from-midnight-950/70 via-transparent to-transparent'
        }`}
      />
      {overlay}
    </div>
  )
}
