import { LandingCrownEffects } from './LandingCrownEffects'

const CROWN = '/landing-crown-premium.png?v=3'

/**
 * Full-size premium crown on the right. The asset is shown uncropped
 * (object-contain); orbital rings, sparkles, and glow are layered on top.
 */
export function LandingCrownHero() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
      <div className="absolute right-[1%] top-1/2 flex h-[min(92vh,920px)] w-[min(98vw,820px)] -translate-y-[48%] items-center justify-center sm:right-[3%] sm:w-[min(86vw,760px)] lg:right-[7%] lg:h-[min(96vh,960px)] lg:w-[min(54vw,780px)] xl:right-[9%] xl:w-[min(50vw,820px)]">
        <div className="relative h-full w-full">
          <img
            src={CROWN}
            alt=""
            width={1536}
            height={1024}
            decoding="async"
            fetchPriority="high"
            className="h-full w-full select-none object-contain object-center mix-blend-lighten"
            style={{ filter: 'drop-shadow(0 28px 60px rgba(0,0,0,0.45))' }}
          />
          <LandingCrownEffects />
        </div>
      </div>
    </div>
  )
}
