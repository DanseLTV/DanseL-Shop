import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Star,
  Sparkles,
} from 'lucide-react'
import type { Product } from '../../types'
import { formatPrice } from '../../data/products'
import { ProductImage } from '../shop/ProductImage'
import { markLandingSeen } from '../../constants/landing'

interface LandingHeroCarouselProps {
  products: Product[]
  loading?: boolean
  onProductSelect?: (product: Product) => void
  compact?: boolean
  /** On lg+ show five cards across the viewport at once. */
  fiveUp?: boolean
}

const AUTO_MS = 6000
const SLIDE_EASE = [0.32, 0.72, 0, 1] as const
const FIVE_UP_GAP_PX = 8
const FIVE_UP_VISIBLE = 5

const categoryTone: Record<string, string> = {
  Streaming: 'border-violet-400/35 bg-violet-500/15 text-violet-200',
  'AI Tools': 'border-cyan-400/35 bg-cyan-500/15 text-cyan-200',
  Writing: 'border-emerald-400/35 bg-emerald-500/15 text-emerald-200',
  Gaming: 'border-amber-400/35 bg-amber-500/15 text-amber-200',
}

function productRating(product: Product) {
  const score = product.featured ? 4.9 : 4.7
  const reviews = 80 + ((product.id.length * 17) % 220)
  return { score, reviews }
}

function CarouselProductCard({
  product,
  active,
  onView,
  compact,
  fiveUp,
  cardWidth,
}: {
  product: Product
  active: boolean
  onView: () => void
  compact?: boolean
  fiveUp?: boolean
  cardWidth?: number | null
}) {
  const { score, reviews } = productRating(product)
  const tone = categoryTone[product.category] ?? 'border-white/20 bg-white/10 text-white/80'

  return (
    <article
      style={cardWidth ? { width: cardWidth } : undefined}
      className={`flex shrink-0 flex-col overflow-hidden rounded-2xl border bg-white/[0.04] shadow-xl backdrop-blur-md transition-[transform,opacity,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        cardWidth
          ? 'min-w-0'
          : fiveUp
            ? 'w-[min(88vw,calc(11.5rem+10vw))]'
            : compact
              ? 'w-[min(88vw,calc(11.5rem+10vw))]'
              : 'w-[min(88vw,17.5rem)] sm:w-[18.5rem]'
      } ${
        active
          ? 'scale-100 border-amber-200/35 opacity-100 shadow-[0_20px_50px_rgba(0,0,0,0.45)]'
          : fiveUp
            ? 'scale-[0.9] border-white/10 opacity-50 lg:scale-100 lg:opacity-80'
            : 'scale-[0.9] border-white/10 opacity-50'
      }`}
    >
      <div className={`relative pb-0 ${fiveUp ? 'p-2 lg:p-1.5' : compact ? 'p-3' : 'p-3'}`}>
        <div className={`flex items-start justify-between gap-1 ${fiveUp ? 'mb-1 lg:mb-1' : 'mb-2'}`}>
          <span
            className={`inline-flex max-w-[58%] items-center rounded-full border font-semibold uppercase tracking-wide ${tone} ${
              fiveUp
                ? 'px-1.5 py-0.5 text-[8px] lg:px-1.5 lg:py-px lg:text-[7px]'
                : 'px-2.5 py-0.5 text-[10px]'
            }`}
          >
            {product.category}
          </span>
          {product.featured && (
            <span
              className={`inline-flex items-center gap-0.5 rounded-full border border-amber-300/40 bg-amber-400/15 font-bold uppercase tracking-wider text-amber-100 ${
                fiveUp
                  ? 'px-1 py-px text-[7px] lg:text-[6px]'
                  : 'gap-1 px-2 py-0.5 text-[9px]'
              }`}
            >
              <Star className={`fill-amber-200 text-amber-200 ${fiveUp ? 'h-2 w-2' : 'h-3 w-3'}`} />
              Featured
            </span>
          )}
        </div>

        <div className="relative overflow-hidden rounded-xl bg-midnight-900">
          <div
            className={`relative w-full ${
              fiveUp
                ? 'h-[clamp(6.5rem,22vw,8.25rem)] lg:h-[4.5rem] xl:h-[5rem]'
                : compact
                  ? 'h-[clamp(6.5rem,22vw,8.25rem)]'
                  : 'h-36 sm:h-40'
            }`}
          >
            <ProductImage
              product={product}
              className="absolute inset-0 h-full w-full"
              priority={active}
              size="hero"
            />
          </div>
        </div>
      </div>

      <div
        className={`flex flex-1 flex-col ${
          fiveUp ? 'px-2 pb-2 pt-1.5 lg:px-1.5 lg:pb-1.5 lg:pt-1' : compact ? 'px-3 pb-3 pt-3' : 'px-4 pb-4 pt-3'
        }`}
      >
        <h3
          className={`line-clamp-1 font-display font-bold text-white ${
            fiveUp ? 'text-sm lg:text-[11px]' : compact ? 'text-sm sm:text-base' : 'text-base sm:text-lg'
          }`}
        >
          {product.name}
        </h3>
        <p
          className={`mt-0.5 text-[10px] uppercase tracking-wider text-white/35 ${fiveUp ? 'lg:hidden' : ''}`}
        >
          SKU: {product.id.replace(/-/g, '').slice(0, 12).toUpperCase()}
        </p>

        <div className={`flex items-center gap-1 ${fiveUp ? 'mt-1 lg:mt-0.5' : 'mt-2 gap-1.5'}`}>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`${fiveUp ? 'h-2 w-2 lg:h-1.5 lg:w-1.5' : 'h-3 w-3'} ${
                  i < Math.floor(score)
                    ? 'fill-amber-300 text-amber-300'
                    : i < score
                      ? 'fill-amber-300/50 text-amber-300/50'
                      : 'text-white/15'
                }`}
              />
            ))}
          </div>
          <span className={`font-semibold text-amber-100/90 ${fiveUp ? 'text-[10px] lg:text-[9px]' : 'text-xs'}`}>
            {score.toFixed(1)}
          </span>
          {!fiveUp && <span className="text-[10px] text-white/40">({reviews})</span>}
        </div>

        <p
          className={`font-display font-bold text-royal-gold ${
            fiveUp ? 'mt-1 text-base lg:mt-0.5 lg:text-sm' : `mt-2.5 ${compact ? 'text-lg' : 'text-xl'}`
          }`}
        >
          {formatPrice(product.price)}
        </p>
        <p
          className={`uppercase tracking-wider text-white/40 ${
            fiveUp ? 'text-[9px] lg:text-[8px]' : 'text-[10px]'
          }`}
        >
          {product.duration}
        </p>

        <button
          type="button"
          onClick={onView}
          className={`inline-flex w-full items-center justify-center gap-1 rounded-xl font-semibold transition ${
            fiveUp
              ? 'mt-1.5 px-2 py-1.5 text-xs lg:mt-1 lg:px-1.5 lg:py-1 lg:text-[9px]'
              : compact
                ? 'mt-3 px-3 py-2 text-xs'
                : 'mt-3 px-4 py-2.5 text-sm'
          } ${
            active
              ? 'bg-gradient-to-r from-brand via-white/90 to-brand-bright text-midnight-950 shadow-glow'
              : 'border border-white/15 bg-white/5 text-white/85 hover:border-brand/40 hover:bg-white/10'
          }`}
        >
          <ShoppingBag className={fiveUp ? 'h-3 w-3 lg:h-2.5 lg:w-2.5' : 'h-4 w-4'} />
          {fiveUp ? <span className="lg:hidden">View Product</span> : 'View Product'}
          {fiveUp && <span className="hidden lg:inline">View</span>}
        </button>
      </div>
    </article>
  )
}

export function LandingHeroCarousel({
  products,
  loading,
  onProductSelect,
  compact,
  fiveUp,
}: LandingHeroCarouselProps) {
  const navigate = useNavigate()
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const count = products.length
  const infinite = count > 1

  const trackProducts = useMemo(
    () => (infinite ? [...products, ...products, ...products] : products),
    [products, infinite]
  )

  const [slideIndex, setSlideIndex] = useState(() => (count > 1 ? count : 0))
  const [trackX, setTrackX] = useState(0)
  const [instant, setInstant] = useState(false)
  const [fiveUpCardWidth, setFiveUpCardWidth] = useState<number | null>(null)
  const slideIndexRef = useRef(slideIndex)
  slideIndexRef.current = slideIndex

  const activeIndex = infinite ? slideIndex % count : 0

  const measureLayout = useCallback(() => {
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track || count === 0) return

    const isFiveUpDesktop = fiveUp && window.matchMedia('(min-width: 1024px)').matches
    if (isFiveUpDesktop) {
      const gaps = FIVE_UP_GAP_PX * (FIVE_UP_VISIBLE - 1)
      const nextWidth = Math.max(0, (viewport.clientWidth - gaps) / FIVE_UP_VISIBLE)
      setFiveUpCardWidth((prev) => (prev !== null && Math.abs(prev - nextWidth) < 0.5 ? prev : nextWidth))
    } else {
      setFiveUpCardWidth((prev) => (prev === null ? prev : null))
    }

    const activeCard = track.children[slideIndex] as HTMLElement | undefined
    if (!activeCard) return

    const viewportCenter = viewport.offsetWidth / 2
    const cardCenter = activeCard.offsetLeft + activeCard.offsetWidth / 2
    setTrackX(viewportCenter - cardCenter)
  }, [count, fiveUp, slideIndex])

  useLayoutEffect(() => {
    measureLayout()
  }, [measureLayout, trackProducts])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const ro = new ResizeObserver(() => measureLayout())
    ro.observe(viewport)
    return () => ro.disconnect()
  }, [measureLayout])

  useEffect(() => {
    if (!fiveUp) return
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = () => measureLayout()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [fiveUp, measureLayout])

  const productKey = products.map((p) => p.id).join('|')

  useEffect(() => {
    if (!infinite) return
    setSlideIndex(count)
    setInstant(true)
  }, [count, infinite, productKey])

  useLayoutEffect(() => {
    if (!instant) return
    const id = requestAnimationFrame(() => setInstant(false))
    return () => cancelAnimationFrame(id)
  }, [instant, slideIndex])

  const snapIfNeeded = useCallback(() => {
    if (!infinite) return
    const i = slideIndexRef.current
    if (i < count) {
      setInstant(true)
      setSlideIndex(i + count)
      return
    }
    if (i >= count * 2) {
      setInstant(true)
      setSlideIndex(i - count)
    }
  }, [count, infinite])

  const goNext = useCallback(() => {
    if (!infinite) return
    setSlideIndex((i) => i + 1)
  }, [infinite])

  const goPrev = useCallback(() => {
    if (!infinite) return
    setSlideIndex((i) => i - 1)
  }, [infinite])

  useEffect(() => {
    if (!infinite) return
    const timer = window.setInterval(goNext, AUTO_MS)
    return () => window.clearInterval(timer)
  }, [infinite, goNext, productKey])

  const openProduct = (product: Product) => {
    if (onProductSelect) {
      onProductSelect(product)
      return
    }
    markLandingSeen()
    navigate(`/shop?product=${encodeURIComponent(product.id)}`)
  }

  if (loading) {
    return (
      <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div
          className={`mx-auto max-w-sm animate-pulse rounded-2xl bg-white/5 ${compact ? 'h-[16rem]' : 'h-[22rem]'}`}
        />
      </div>
    )
  }

  if (count === 0) return null

  return (
    <div className="relative w-full min-w-0">
      <div className={`px-1 ${fiveUp ? 'mb-1.5 lg:mb-1' : compact ? 'mb-2' : 'mb-3'}`}>
        <p
          className={`flex items-center justify-center gap-1.5 font-bold uppercase tracking-[0.22em] text-amber-200/75 ${
            fiveUp ? 'text-[9px] sm:text-[10px] lg:text-[9px]' : compact ? 'text-[9px] sm:text-[10px]' : 'text-[10px] sm:text-[11px]'
          }`}
        >
          <Sparkles className="h-3 w-3" />
          Premium picks
        </p>
      </div>

      <div className="relative">
        {infinite && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-0 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-midnight-950/80 text-white/80 shadow-lg backdrop-blur-md transition hover:border-brand/40 hover:text-white sm:-left-3 lg:h-8 lg:w-8 lg:-left-2"
              aria-label="Previous product"
            >
              <ChevronLeft className="h-5 w-5 lg:h-4 lg:w-4" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-0 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-midnight-950/80 text-white/80 shadow-lg backdrop-blur-md transition hover:border-brand/40 hover:text-white sm:-right-3 lg:h-8 lg:w-8 lg:-right-2"
              aria-label="Next product"
            >
              <ChevronRight className="h-5 w-5 lg:h-4 lg:w-4" />
            </button>
          </>
        )}

        <div
          ref={viewportRef}
          className={`overflow-hidden ${fiveUp ? 'px-2 sm:px-4 lg:px-8' : 'px-2 sm:px-6'}`}
        >
          <motion.div
            ref={trackRef}
            className={`flex w-max items-center ${fiveUp ? 'gap-3 sm:gap-4 lg:gap-2' : 'gap-3 sm:gap-5'}`}
            animate={{ x: trackX }}
            transition={{ duration: instant ? 0 : 0.45, ease: SLIDE_EASE }}
            onAnimationComplete={snapIfNeeded}
          >
            {trackProducts.map((product, i) => (
              <CarouselProductCard
                key={`${product.id}-${i}`}
                product={product}
                active={infinite ? i === slideIndex : i === activeIndex}
                onView={() => openProduct(product)}
                compact={compact}
                fiveUp={fiveUp}
                cardWidth={fiveUpCardWidth}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
