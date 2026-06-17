import { Users, Zap, ShieldCheck, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { fadeInUp } from '../../utils/animations'

const stats = [
  { icon: Users, value: '500+', label: 'Satisfied Customers' },
  { icon: Zap, value: '15 to 60 min', label: 'Fast Delivery' },
  { icon: ShieldCheck, value: 'Premium', label: 'Premium Access' },
  { icon: MessageCircle, value: 'Official', label: 'Trusted Seller' },
]

export function LandingStatsBar({ className }: { className?: string }) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      transition={{ delay: 0.45 }}
      className={`relative z-20 shrink-0 px-4 pb-4 pt-2 sm:px-6 lg:px-10 lg:pb-4 lg:pt-3 ${className ?? ''}`}
    >
      <div className="mx-auto max-w-5xl rounded-2xl border border-amber-200/20 bg-black/50 px-4 py-3 backdrop-blur-xl sm:px-6 lg:py-2.5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center justify-center gap-1.5 text-center sm:flex-row sm:gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-200/15 bg-amber-100/[0.04]">
                <Icon className="h-3.5 w-3.5 text-amber-200/85" />
              </span>
              <div className="min-w-0">
                <p className="font-display text-xs font-bold tabular-nums text-amber-50 sm:text-sm">
                  {value}
                </p>
                <p className="truncate text-[9px] uppercase tracking-wider text-amber-100/40 sm:text-[10px]">
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
