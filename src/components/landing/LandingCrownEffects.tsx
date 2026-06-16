import { motion } from 'framer-motion'

const SPARKLES = [
  { left: '18%', top: '22%', delay: 0, size: 3 },
  { left: '72%', top: '18%', delay: 0.6, size: 2 },
  { left: '84%', top: '38%', delay: 1.1, size: 2.5 },
  { left: '28%', top: '48%', delay: 0.3, size: 2 },
  { left: '62%', top: '56%', delay: 1.8, size: 3 },
  { left: '44%', top: '30%', delay: 2.2, size: 2 },
  { left: '78%', top: '62%', delay: 0.9, size: 2 },
]

export function LandingCrownEffects() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-visible">
      {/* Top spotlight */}
      <div
        className="absolute left-1/2 top-[-6%] h-[55%] w-[70%] -translate-x-1/2 rounded-full blur-[90px]"
        style={{
          background:
            'radial-gradient(ellipse, rgba(255,200,90,0.28) 0%, rgba(255,150,45,0.08) 48%, transparent 72%)',
        }}
      />

      {/* Orbital rings — layered on top of the crown image */}
      {[
        { w: '92%', h: '54%', top: '38%', opacity: 0.28, duration: 42 },
        { w: '78%', h: '46%', top: '42%', opacity: 0.22, duration: 34 },
        { w: '104%', h: '60%', top: '36%', opacity: 0.16, duration: 52 },
      ].map((ring, i) => (
        <div
          key={i}
          className="absolute left-1/2"
          style={{
            width: ring.w,
            height: ring.h,
            top: ring.top,
            opacity: ring.opacity,
            transform: 'translateX(-50%) rotateX(72deg)',
          }}
        >
          <motion.div
            className="h-full w-full rounded-full border border-amber-200/30"
            style={{ boxShadow: '0 0 24px rgba(255,196,90,0.12)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: ring.duration, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      ))}

      {/* Floating sparkles */}
      {SPARKLES.map((s, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-amber-200"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            boxShadow: '0 0 8px rgba(255,210,120,0.9)',
          }}
          animate={{ opacity: [0.2, 0.95, 0.2], y: [0, -10, 0] }}
          transition={{
            duration: 3.2 + i * 0.3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: s.delay,
          }}
        />
      ))}
    </div>
  )
}
