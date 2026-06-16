import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

/**
 * Premium landing backdrop: soft cloudy gradients + a dim spotlight that
 * follows the cursor (no visible ring outline).
 */
export function LandingCursorGlow() {
  const boundsRef = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 55, damping: 22, mass: 0.5 })
  const sy = useSpring(my, { stiffness: 55, damping: 22, mass: 0.5 })

  useEffect(() => {
    const el = boundsRef.current
    if (!el) return

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      mx.set(e.clientX - rect.left)
      my.set(e.clientY - rect.top)
    }

    const center = () => {
      const rect = el.getBoundingClientRect()
      mx.set(rect.width / 2)
      my.set(rect.height / 2)
    }

    center()
    window.addEventListener('pointermove', onMove)
    window.addEventListener('resize', center)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('resize', center)
    }
  }, [mx, my])

  return (
    <div ref={boundsRef} className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Warm wash — full viewport, no boxed edges */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          background:
            'radial-gradient(ellipse 100% 75% at 52% 28%, rgba(255,196,90,0.14) 0%, transparent 72%)',
        }}
      />

      {/* Cursor spotlight — warm royal gold, no outline ring */}
      <motion.div
        className="absolute h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
        style={{
          left: sx,
          top: sy,
          background:
            'radial-gradient(circle, rgba(255,196,90,0.14) 0%, rgba(255,160,60,0.07) 38%, transparent 72%)',
        }}
      />

      {/* Drifting cloud layers */}
      <motion.div
        className="absolute -left-48 top-[10%] h-[28rem] w-[40rem] rounded-full bg-white/[0.06] blur-[140px]"
        animate={{ x: [0, 60, 0], y: [0, 24, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-48 top-[6%] h-[26rem] w-[38rem] rounded-full bg-amber-200/[0.05] blur-[140px]"
        animate={{ x: [0, -50, 0], y: [0, 30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -left-16 bottom-[6%] h-80 w-[32rem] rounded-full bg-white/[0.05] blur-[120px]"
        animate={{ x: [0, 40, 0], y: [0, -20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-[6%] bottom-[10%] h-72 w-[26rem] rounded-full bg-amber-100/[0.05] blur-[110px]"
        animate={{ x: [0, -36, 0], y: [0, -26, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Top + bottom vignette for depth */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
  )
}
