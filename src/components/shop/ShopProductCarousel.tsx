import type { Product } from '../../types'
import { useLandingCarousel } from '../../hooks/useLandingCarousel'
import { LandingHeroCarousel } from '../landing/LandingHeroCarousel'

interface ShopProductCarouselProps {
  onProductSelect?: (product: Product) => void
  compact?: boolean
  fiveUp?: boolean
  /** Landing hero — no bottom margin, full-size cards. */
  landing?: boolean
}

export function ShopProductCarousel({
  onProductSelect,
  compact,
  fiveUp,
  landing,
}: ShopProductCarouselProps) {
  const { products, loading } = useLandingCarousel()

  if (!loading && products.length === 0) return null

  return (
    <div className={landing || compact || fiveUp ? undefined : 'mb-8'}>
      <LandingHeroCarousel
        products={products}
        loading={loading}
        onProductSelect={onProductSelect}
        compact={compact}
        fiveUp={fiveUp}
      />
    </div>
  )
}
