import { Link, Navigate, useLocation, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { RoyalPageBackground } from '../components/ui/RoyalPageBackground'
import { LandingNav } from '../components/landing/LandingNav'
import { LandingStatsBar } from '../components/landing/LandingStatsBar'
import { useLandingRipples } from '../components/landing/LandingRipple'
import { ShopProductCarousel } from '../components/shop/ShopProductCarousel'
import { landingCopy } from '../constants/landingCopy'
import { hasSeenLanding, isLandingPreview, markLandingSeen } from '../constants/landing'
import { fadeInUp, staggerContainer } from '../utils/animations'

const ROYAL_GOLD = '#ffc45a'

function leaveLanding() {
  markLandingSeen()
}

export function LandingPage() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const preview = isLandingPreview(searchParams.toString())
  const { addRipple, RippleLayer } = useLandingRipples()
  const onLandingRoute = location.pathname === '/'
  const showLanding = onLandingRoute && (!hasSeenLanding() || preview)

  if (!onLandingRoute) {
    return null
  }

  if (!showLanding) {
    return <Navigate to="/shop" replace />
  }

  return (
    <section
      className="relative flex min-h-dvh flex-col overflow-x-hidden bg-[#030302]"
    >
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <RoyalPageBackground />
      </div>
      <RippleLayer accent={ROYAL_GOLD} />

      <LandingNav onLeave={leaveLanding} />

      <div className="relative z-10 flex min-h-dvh flex-col" onPointerDown={addRipple}>
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pt-14 pb-6 sm:px-6 sm:pt-[3.75rem] lg:px-10 lg:pt-[4.5rem]">
          <div className="flex flex-col items-center justify-center gap-4 py-3 sm:gap-5 sm:py-4 lg:gap-4 lg:py-3">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="flex w-full flex-col items-center text-center"
            >
              <motion.h1
                variants={fadeInUp}
                className="font-royal w-full text-balance text-center text-[clamp(1.5rem,2.8vw+0.85rem,2.75rem)] font-bold leading-[1.08] tracking-tight lg:text-[clamp(1.65rem,2.2vw+0.5rem,2.35rem)]"
              >
                <span className="text-royal-gold lg:whitespace-nowrap">
                  {landingCopy.headlineLine1} {landingCopy.headlineLine2}
                </span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="mx-auto mt-1.5 max-w-[min(100%,42rem)] text-center text-sm leading-snug text-white/60 sm:mt-2 sm:text-base lg:mt-2 lg:max-w-[52rem] lg:text-[0.8125rem] lg:leading-snug xl:text-sm"
              >
                {landingCopy.descriptionLine1}
                <br />
                {landingCopy.descriptionLine2}
              </motion.p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.05 }}
              className="relative mx-auto w-full min-w-0"
            >
              <ShopProductCarousel landing />
            </motion.div>

            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.08 }}
              className="flex w-full justify-center pb-2"
            >
              <Link
                to="/shop"
                replace
                onClick={leaveLanding}
                className="btn-royal-gold"
              >
                {landingCopy.ctaPrimary}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </div>

        <LandingStatsBar className="shrink-0" />
      </div>
    </section>
  )
}
