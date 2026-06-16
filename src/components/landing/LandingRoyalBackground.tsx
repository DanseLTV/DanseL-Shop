import { motion } from 'framer-motion'

const GOLD = '#ffc45a'

/**
 * Full-bleed ambient lighting only — no boxed layers, so there are no
 * straight edges or cropped-looking seams in the background.
 */
export function LandingRoyalBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#030302]">
      {/* Base depth — centered, spans entire viewport */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 130% 110% at 50% 48%, #12100c 0%, #080604 42%, #030302 100%)',
        }}
      />

      {/* Subtle grain */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Top glow — wide ellipse, soft falloff across full width */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 95% 72% at 58% -8%, rgba(255,200,95,0.24) 0%, rgba(255,150,45,0.07) 38%, transparent 72%)',
        }}
      />

      {/* Right-side warmth — large, feathered, no box edge */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 65% 58% at 82% 32%, rgba(255,196,90,0.11) 0%, transparent 68%)',
        }}
      />

      {/* Left-side balance — very subtle so the hero feels even */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 55% 50% at 18% 38%, rgba(255,196,90,0.05) 0%, transparent 65%)',
        }}
      />

      {/* Gentle center wash — fills the middle, prevents a dark seam */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 55% at 50% 42%, ${GOLD}0a, transparent 68%)`,
        }}
      />

      {/* Slow breathing highlight — opacity only, full-screen layer */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 85% 65% at 62% 18%, rgba(255,215,120,0.09) 0%, transparent 62%)',
        }}
        animate={{ opacity: [0.55, 1, 0.55] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Edge vignettes */}
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/45 to-transparent" />
    </div>
  )
}
