import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Shield, Zap } from 'lucide-react'
import { AnimatedBackground } from '../ui/AnimatedBackground'
import { GradientButton } from '../ui/GradientButton'
import { fadeInUp, staggerContainer } from '../../utils/animations'

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-20">
      <AnimatedBackground />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-4xl text-center"
        >
          <motion.div
            variants={fadeInUp}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-violet/30 bg-accent-violet/10 px-4 py-2 text-sm text-accent-violet"
          >
            <Sparkles className="h-4 w-4" />
            Premium Digital Accounts · Authorized Access
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-7xl"
          >
            Your Gateway to{' '}
            <span className="gradient-text">Premium Digital</span>{' '}
            Subscriptions
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg lg:text-xl"
          >
            DANSEL SHOP delivers trusted, affordable premium account access with
            fast delivery and replacement guarantee. Stream, create, and work
            without breaking the bank.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <GradientButton to="/shop" size="lg">
              Browse Shop
              <ArrowRight className="h-5 w-5" />
            </GradientButton>
            <GradientButton to="/#how-to-order" variant="outline" size="lg">
              How to Order
            </GradientButton>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            {[
              { icon: Shield, label: 'Trusted & Verified', value: '1000+' },
              { icon: Zap, label: 'Avg. Delivery Time', value: '15–60 min' },
              { icon: Sparkles, label: 'Happy Customers', value: '500+' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="glass-card flex items-center gap-4 p-4 sm:flex-col sm:gap-2 sm:p-6"
              >
                <stat.icon className="h-6 w-6 text-accent-violet sm:mb-2" />
                <div className="sm:text-center">
                  <p className="font-display text-xl font-bold text-white sm:text-2xl">
                    {stat.value}
                  </p>
                  <p className="text-xs text-white/50 sm:text-sm">{stat.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-midnight-950 to-transparent" />
    </section>
  )
}
