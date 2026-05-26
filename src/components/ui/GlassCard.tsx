import { motion } from 'framer-motion'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function GlassCard({
  children,
  className = '',
  hover = false,
  onClick,
}: GlassCardProps) {
  const base = hover ? 'glass-card-hover cursor-pointer' : 'glass-card'

  if (onClick) {
    return (
      <motion.div
        className={`${base} ${className}`}
        onClick={onClick}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    )
  }

  return <div className={`${base} ${className}`}>{children}</div>
}
