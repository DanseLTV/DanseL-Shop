import { LandingRoyalBackground } from '../landing/LandingRoyalBackground'
import { LandingCursorGlow } from '../landing/LandingCursorGlow'
import { LandingParticles } from '../landing/LandingParticles'

/** Landing-style animated gold backdrop for shop / home pages. */
export function RoyalPageBackground() {
  return (
    <>
      <LandingRoyalBackground />
      <LandingCursorGlow />
      <LandingParticles />
    </>
  )
}
