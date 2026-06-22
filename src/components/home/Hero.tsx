import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { GradientButton } from '../ui/GradientButton'
import { BackNavLink } from '../ui/BackNavLink'
import { fadeInUp, staggerContainer } from '../../utils/animations'

const anchorLinks = [
  { label: 'How to order', hash: '#how-to-order' },
  { label: 'Reviews', hash: '#reviews' },
  { label: 'FAQ', hash: '#faq' },
  { label: 'Contact', hash: '#contact' },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-16 sm:pt-28 sm:pb-20">
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <BackNavLink to="/shop" label="Back to home" className="mb-6" />
        <motion.div
          className="text-center"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={fadeInUp}
            className="text-eyebrow mb-5 inline-flex items-center gap-2 rounded-full border border-amber-200/25 bg-amber-400/10 px-4 py-2 !tracking-[0.16em]"
          >
            <Sparkles className="h-4 w-4" />
            About DANSEL SHOP
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-display-md"
          >
            Trusted premium access,{' '}
            <span className="text-royal-gold">explained clearly</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-lead mx-auto mt-5 max-w-2xl"
          >
            Learn how ordering works, what we guarantee, and why customers choose
            us — then browse the shop when you are ready.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <GradientButton to="/shop" size="lg">
              Browse Shop
              <ArrowRight className="h-5 w-5" />
            </GradientButton>
          </motion.div>

          <motion.nav
            variants={fadeInUp}
            aria-label="On this page"
            className="mt-8 flex flex-wrap items-center justify-center gap-2"
          >
            {anchorLinks.map((item) => (
              <Link
                key={item.hash}
                to={`/home${item.hash}`}
                className="text-caption rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 font-medium transition-colors hover:border-amber-200/40 hover:text-amber-100"
              >
                {item.label}
              </Link>
            ))}
          </motion.nav>
        </motion.div>
      </div>
    </section>
  )
}
