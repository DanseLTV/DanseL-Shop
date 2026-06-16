import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'
import { LandingRoyalBackground } from '../components/landing/LandingRoyalBackground'
import { LandingCursorGlow } from '../components/landing/LandingCursorGlow'
import { LandingParticles } from '../components/landing/LandingParticles'
import { LandingNav } from '../components/landing/LandingNav'
import { LandingStatsBar } from '../components/landing/LandingStatsBar'
import { useLandingRipples } from '../components/landing/LandingRipple'
import { ShopProductCarousel } from '../components/shop/ShopProductCarousel'
import { useLandingDesktopLock } from '../hooks/useLandingDesktopLock'
import { landingCopy } from '../constants/landingCopy'
import { hasSeenLanding, isLandingPreview, markLandingSeen } from '../constants/landing'
import { fadeInUp, staggerContainer } from '../utils/animations'

const ROYAL_GOLD = '#ffc45a'

function leaveLanding() {
  markLandingSeen()
}

export function LandingPage() {
  const [searchParams] = useSearchParams()
  const preview = isLandingPreview(searchParams.toString())
  const { addRipple, RippleLayer } = useLandingRipples()
  const showLanding = !hasSeenLanding() || preview

  useLandingDesktopLock(showLanding)

  if (!showLanding) {
    return <Navigate to="/shop" replace />
  }

  return (
    <section
      className="relative flex min-h-dvh flex-col overflow-x-hidden bg-[#030302] lg:h-full lg:min-h-0 lg:overflow-hidden"
      onPointerDown={addRipple}
    >
      <LandingRoyalBackground />
      <LandingCursorGlow />
      <LandingParticles />
      <RippleLayer accent={ROYAL_GOLD} />

      <LandingNav onLeave={leaveLanding} />

      <div className="relative z-10 flex min-h-dvh flex-col lg:h-full lg:min-h-0 lg:overflow-hidden">
        <div className="mx-auto flex w-full max-w-[90rem] flex-1 flex-col px-4 pt-14 sm:px-6 sm:pt-[3.75rem] lg:px-10 lg:pt-[4.5rem]">
          <div className="flex flex-1 flex-col items-center justify-center gap-5 py-4 sm:gap-6 sm:py-5 lg:gap-5 lg:py-4">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="flex w-full max-w-3xl flex-col items-center px-1 text-center lg:max-w-none"
            >
              <motion.h1
                variants={fadeInUp}
                className="font-royal max-w-full text-balance text-[clamp(1.5rem,2.8vw+0.85rem,2.75rem)] font-bold leading-[1.08] tracking-tight lg:text-[clamp(1.65rem,2.2vw+0.5rem,2.35rem)]"
              >
                <span className="text-royal-gold lg:whitespace-nowrap">
                  {landingCopy.headlineLine1} {landingCopy.headlineLine2}
                </span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="mx-auto mt-2 max-w-[min(100%,42rem)] text-center text-sm leading-snug text-white/60 sm:mt-2.5 sm:text-base lg:mt-3 lg:max-w-[58rem] lg:text-[0.8125rem] lg:leading-[1.45] xl:text-sm"
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
              transition={{ delay: 0.15 }}
              className="relative w-full min-w-0 lg:max-w-[90rem]"
            >
              <ShopProductCarousel landing />
            </motion.div>

            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.25 }}
              className="flex w-full flex-col items-center justify-center gap-2.5 sm:flex-row sm:gap-3"
            >
              <Link
                to="/shop"
                replace
                onClick={leaveLanding}
                className="btn-royal-gold w-full max-w-sm px-5 py-2.5 text-sm sm:w-auto sm:max-w-none lg:px-6 lg:py-2.5"
              >
                {landingCopy.ctaPrimary}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/home"
                replace
                onClick={leaveLanding}
                className="btn-royal-gold-outline w-full max-w-sm px-5 py-2.5 text-sm sm:w-auto sm:max-w-none lg:px-6 lg:py-2.5"
              >
                <Play className="h-4 w-4 fill-current" />
                {landingCopy.ctaSecondary}
              </Link>
            </motion.div>
          </div>
        </div>

        <LandingStatsBar className="shrink-0" />
      </div>
    </section>
  )
}
