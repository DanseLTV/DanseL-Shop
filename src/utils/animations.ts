import { type Variants } from 'framer-motion'

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

export const floatAnimation = {
  y: [0, -12, 0],
  transition: {
    duration: 6,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
}

/** Quick slide between routes — no fade (stays fully visible) */
export const pageTransition: Variants = {
  initial: {
    y: 10,
  },
  animate: {
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    y: -6,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 1, 1],
    },
  },
}

export const pageTransitionReduced: Variants = {
  initial: {},
  animate: {},
  exit: {},
}
