import { useEffect, useRef } from 'react'

const ACCENT = '#ffc45a'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
}

export function LandingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let frame = 0
    let particles: Particle[] = []
    let pointer = { x: 0, y: 0, active: false }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const { width, height } = canvas.getBoundingClientRect()
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = Math.floor((width * height) / 20000)
      particles = Array.from({ length: Math.min(count, 40) }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.45 + 0.15,
      }))
    }

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true }
    }

    const onLeave = () => {
      pointer.active = false
    }

    const draw = () => {
      if (document.hidden) {
        frame = requestAnimationFrame(draw)
        return
      }

      const { width, height } = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, width, height)

      for (const p of particles) {
        if (pointer.active) {
          const dx = pointer.x - p.x
          const dy = pointer.y - p.y
          const dist = Math.hypot(dx, dy) || 1
          if (dist < 130) {
            p.vx -= (dx / dist) * 0.018
            p.vy -= (dy / dist) * 0.018
          }
        }

        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.99
        p.vy *= 0.99

        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = ACCENT
        ctx.fill()
        ctx.globalAlpha = 1
      }

      frame = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    />
  )
}
