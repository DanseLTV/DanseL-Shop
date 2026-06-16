import type { CSSProperties } from 'react'

export const BRAND_FLAMES = [
  'radial-gradient(circle at 50% 85%, #ffffff 0%, #c9c9d1 55%, transparent 72%)',
  'radial-gradient(circle at 50% 85%, #f4f4f6 0%, #a8a8b2 50%, transparent 70%)',
  'radial-gradient(circle at 50% 85%, #e7e7ec 0%, #8c8c97 55%, transparent 72%)',
  'radial-gradient(circle at 50% 85%, #fbfbfd 0%, #9a9aa4 50%, transparent 70%)',
  'radial-gradient(circle at 50% 85%, #ffffff 0%, #bfbfc8 45%, transparent 68%)',
]

export type FireBubbleSpec = {
  id: string
  size: string
  distance: string
  position: string
  time: string
  delay: string
  gradient: string
}

export function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

export function makeFireBubbles(
  count: number,
  seedOffset: number,
  sizeScale: number
): FireBubbleSpec[] {
  return Array.from({ length: count }, (_, i) => {
    const r1 = pseudoRandom(i + seedOffset)
    const r2 = pseudoRandom(i + seedOffset + 19)
    const r3 = pseudoRandom(i + seedOffset + 37)
    const r4 = pseudoRandom(i + seedOffset + 53)
    const r5 = pseudoRandom(i + seedOffset + 71)
    const sizeRem = (1.1 + r1 * 2.4) * sizeScale
    return {
      id: `${seedOffset}-${i}`,
      size: `${sizeRem.toFixed(2)}rem`,
      distance: `${3.5 + r2 * 4.5}rem`,
      position: `${-2 + r3 * 104}%`,
      time: `${1.6 + r4 * 2}s`,
      delay: `${-(1 + r5 * 3.5)}s`,
      gradient: BRAND_FLAMES[i % BRAND_FLAMES.length],
    }
  })
}

export function bubbleStyle(b: FireBubbleSpec): CSSProperties {
  return {
    '--size': b.size,
    '--distance': b.distance,
    '--position': b.position,
    '--time': b.time,
    '--delay': b.delay,
    background: b.gradient,
  } as CSSProperties
}
