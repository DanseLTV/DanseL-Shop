import { motion, type HTMLMotionProps } from 'framer-motion'
import { forwardRef } from 'react'
import { fadeInUp } from '../../utils/animations'

interface ScrollRevealProps extends HTMLMotionProps<'div'> {
  delay?: number
}

export const ScrollReveal = forwardRef<HTMLDivElement, ScrollRevealProps>(
  ({ children, delay = 0, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={fadeInUp}
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.div>
  )
)

ScrollReveal.displayName = 'ScrollReveal'
