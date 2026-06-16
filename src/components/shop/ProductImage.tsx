import { useEffect, useState } from 'react'
import type { Product } from '../../types'
import { isLocalProductImage } from '../../data/productImages'

interface ProductImageProps {
  product: Product
  className?: string
  overlay?: React.ReactNode
  size?: 'card' | 'modal' | 'hero'
  /** Load immediately (admin preview, modals) */
  priority?: boolean
}

export function ProductImage({
  product,
  className = '',
  overlay,
  size = 'card',
  priority = false,
}: ProductImageProps) {
  const fallbackSvg = `/products/${product.id}.svg`
  const resolveSrc = (image?: string) =>
    image?.trim() ? image.trim() : fallbackSvg

  const [src, setSrc] = useState(() => resolveSrc(product.image))
  const [loaded, setLoaded] = useState(true)
  const isLocal = isLocalProductImage(src)
  const isCover = product.imageFit === 'cover' || !isLocal

  useEffect(() => {
    const next = resolveSrc(product.image)
    setSrc(next)
    setLoaded(true)
  }, [product.image, product.id])

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
        loading={priority || size !== 'card' ? 'eager' : 'lazy'}
        decoding="async"
      />

      {overlay}
    </div>
  )
}
