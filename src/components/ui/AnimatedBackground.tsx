import { motion } from 'framer-motion'

export function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 mesh-bg" />
      <motion.div
        className="absolute left-1/2 top-1/2 h-[46rem] w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent-cyan/20"
        animate={{ rotate: [360, 0] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-accent-violet/20 blur-[120px]"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-32 top-40 h-80 w-80 rounded-full bg-accent-cyan/15 blur-[100px]"
        animate={{
          x: [0, -40, 0],
          y: [0, 50, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-accent-pink/10 blur-[80px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-2 w-2 rounded-full bg-white/40"
          style={{
            left: `${12 + i * 11}%`,
            top: `${15 + ((i * 7) % 60)}%`,
          }}
          animate={{
            y: [0, -18, 0],
            opacity: [0.25, 0.8, 0.25],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 4 + (i % 4),
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.35,
          }}
        />
      ))}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  )
}
