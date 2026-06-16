import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { bubbleStyle, makeFireBubbles } from './fire/fireShared'

const HIDE_ON = ['/admin', '/login', '/signup', '/forgot-password']

function EdgeColumn({ seed, mirrored }: { seed: number; mirrored?: boolean }) {
  const bubbles = useMemo(() => makeFireBubbles(18, seed, 0.75), [seed])

  return (
    <div
      className={`fire-edge-fx ${mirrored ? 'fire-edge-fx--right' : 'fire-edge-fx--left'}`}
      aria-hidden
    >
      <div className="fire-edge-fx__haze" />
      <div className="fire-edge-fx__bubbles">
        {bubbles.map((b) => (
          <span key={b.id} className="fire-footer-fx__bubble" style={bubbleStyle(b)} />
        ))}
      </div>
    </div>
  )
}

/** Subtle vertical arcane fire on screen edges — desktop shop pages only */
export function ScreenEdgeFire() {
  const { pathname } = useLocation()
  const hidden = HIDE_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  if (hidden) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-0 hidden lg:block" aria-hidden>
      <EdgeColumn seed={900} />
      <EdgeColumn seed={1200} mirrored />
    </div>
  )
}
