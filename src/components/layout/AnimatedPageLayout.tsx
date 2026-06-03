import { useOutlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { pageTransition, pageTransitionReduced } from '../../utils/animations'

export function AnimatedPageLayout() {
  const location = useLocation()
  const outlet = useOutlet()
  const prefersReducedMotion = useReducedMotion()

  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={prefersReducedMotion ? pageTransitionReduced : pageTransition}
        className="min-h-full w-full will-change-transform"
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  )
}
