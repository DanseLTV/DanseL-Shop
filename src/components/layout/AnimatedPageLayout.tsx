import { useOutlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  getRouteAnimationKey,
  pageTransition,
  pageTransitionReduced,
} from '../../utils/animations'

export function AnimatedPageLayout() {
  const location = useLocation()
  const outlet = useOutlet()
  const prefersReducedMotion = useReducedMotion()
  const pageKey = getRouteAnimationKey(location.pathname)

  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        key={pageKey}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={prefersReducedMotion ? pageTransitionReduced : pageTransition}
        className="flex w-full min-w-0 flex-1 flex-col will-change-transform"
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  )
}
