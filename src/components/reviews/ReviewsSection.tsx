import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, BadgeCheck } from 'lucide-react'
import type { Review } from '../../types'
import { ScrollReveal } from '../ui/ScrollReveal'
import { SectionHeading } from '../ui/SectionHeading'

interface ReviewsSectionProps {
  reviews: Review[]
}

export function ReviewsSection({ reviews }: ReviewsSectionProps) {
  const [current, setCurrent] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  useEffect(() => {
    if (!autoplay) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % reviews.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [autoplay, reviews.length])

  const prev = () => {
    setAutoplay(false)
    setCurrent((c) => (c - 1 + reviews.length) % reviews.length)
  }

  const next = () => {
    setAutoplay(false)
    setCurrent((c) => (c + 1) % reviews.length)
  }

  return (
    <section id="reviews" className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 mesh-bg opacity-30" />
      <div className="relative mx-auto max-w-7xl">
        <ScrollReveal>
          <SectionHeading
            badge="Customer Proof"
            title="Trusted by Happy Customers"
            subtitle="Real reviews from verified buyers. See why people choose DANSEL SHOP for premium digital access."
          />
        </ScrollReveal>

        <div className="relative mx-auto max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              className="glass-card p-8 sm:p-10"
            >
              <div className="mb-4 flex gap-1">
                {Array.from({ length: reviews[current].rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <blockquote className="text-lg leading-relaxed text-white/90 sm:text-xl">
                &ldquo;{reviews[current].comment}&rdquo;
              </blockquote>
              <div className="mt-6 flex items-center justify-between">
                <div>
                  <p className="font-display font-semibold text-white">
                    {reviews[current].name}
                  </p>
                  <p className="text-sm text-white/50">
                    {reviews[current].product} · {reviews[current].date}
                  </p>
                </div>
                {reviews[current].verified && (
                  <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verified
                  </span>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={prev}
              className="rounded-full border border-white/15 bg-white/5 p-2 text-white/70 transition-all hover:border-brand/40 hover:text-white"
              aria-label="Previous review"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setAutoplay(false)
                    setCurrent(i)
                  }}
                  className={`h-2 rounded-full transition-all ${
                    i === current
                      ? 'w-8 bg-brand'
                      : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Go to review ${i + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={next}
              className="rounded-full border border-white/15 bg-white/5 p-2 text-white/70 transition-all hover:border-brand/40 hover:text-white"
              aria-label="Next review"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.slice(0, 3).map((review, i) => (
            <ScrollReveal key={review.id} delay={i * 0.1}>
              <div className="glass-card-hover h-full p-5">
                <div className="mb-2 flex gap-0.5">
                  {Array.from({ length: review.rating }).map((_, j) => (
                    <Star
                      key={j}
                      className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="line-clamp-3 text-sm text-white/70">
                  &ldquo;{review.comment}&rdquo;
                </p>
                <p className="mt-3 text-xs font-medium text-white/50">
                  — {review.name}, {review.product}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
