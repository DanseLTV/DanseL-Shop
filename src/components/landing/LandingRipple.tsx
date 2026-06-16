import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Ripple {
  id: number
  x: number
  y: number
}

export function useLandingRipples() {
  const [ripples, setRipples] = useState<Ripple[]>([])

  const addRipple = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const id = Date.now()
    setRipples((prev) => [
      ...prev.slice(-5),
      { id, x: e.clientX - rect.left, y: e.clientY - rect.top },
    ])
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id))
    }, 900)
  }, [])

  const RippleLayer = ({ accent }: { accent: string }) => (
    <AnimatePresence>
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          initial={{ width: 0, height: 0, opacity: 0.5 }}
          animate={{ width: 280, height: 280, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.85, ease: 'easeOut' }}
          className="pointer-events-none absolute rounded-full"
          style={{
            left: r.x,
            top: r.y,
            transform: 'translate(-50%, -50%)',
            border: `1px solid ${accent}`,
            boxShadow: `0 0 40px ${accent}44`,
          }}
        />
      ))}
    </AnimatePresence>
  )

  return { addRipple, RippleLayer }
}
