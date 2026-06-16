import { useMemo } from 'react'
import { bubbleStyle, makeFireBubbles } from './fire/fireShared'

const BACK_COUNT = 28
const FRONT_COUNT = 52

function BubbleLayer({
  bubbles,
  layerClass,
}: {
  bubbles: ReturnType<typeof makeFireBubbles>
  layerClass: string
}) {
  return (
    <div className={layerClass}>
      {bubbles.map((b) => (
        <span key={b.id} className="fire-footer-fx__bubble" style={bubbleStyle(b)} />
      ))}
    </div>
  )
}

export function FireFooterEffect() {
  const back = useMemo(() => makeFireBubbles(BACK_COUNT, 0, 1.35), [])
  const front = useMemo(() => makeFireBubbles(FRONT_COUNT, 500, 0.85), [])

  return (
    <div className="fire-footer-fx" aria-hidden>
      <div className="fire-footer-fx__base" />
      <div className="fire-footer-fx__haze" />
      <BubbleLayer bubbles={back} layerClass="fire-footer-fx__bubbles fire-footer-fx__bubbles--back" />
      <BubbleLayer bubbles={front} layerClass="fire-footer-fx__bubbles fire-footer-fx__bubbles--front" />
    </div>
  )
}
