import { useEffect, useRef } from 'react'
import { motion, useMotionValue } from 'framer-motion'

/**
 * Premium landing backdrop: soft gradients + cursor spotlight (no heavy animated blurs).
 */
export function LandingCursorGlow() {
  const boundsRef = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)

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
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('resize', center)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('resize', center)
    }
  }, [mx, my])

  return (
    <div ref={boundsRef} className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          background:
            'radial-gradient(ellipse 100% 75% at 52% 28%, rgba(255,196,90,0.14) 0%, transparent 72%)',
        }}
      />

      <motion.div
        className="absolute h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl will-change-[left,top]"
        style={{
          left: mx,
          top: my,
          background:
            'radial-gradient(circle, rgba(255,196,90,0.14) 0%, rgba(255,160,60,0.07) 38%, transparent 72%)',
        }}
      />

      {/* Static cloud washes — no infinite motion (lighter on GPU) */}
      <div className="absolute -left-48 top-[10%] h-[28rem] w-[40rem] rounded-full bg-white/[0.06] blur-[100px]" />
      <div className="absolute -right-48 top-[6%] h-[26rem] w-[38rem] rounded-full bg-amber-200/[0.05] blur-[100px]" />
      <div className="absolute -left-16 bottom-[6%] h-80 w-[32rem] rounded-full bg-white/[0.05] blur-[90px]" />
      <div className="absolute right-[6%] bottom-[10%] h-72 w-[26rem] rounded-full bg-amber-100/[0.05] blur-[80px]" />

      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
  )
}
