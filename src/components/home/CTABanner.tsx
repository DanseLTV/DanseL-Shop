import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { GradientButton } from '../ui/GradientButton'
import { OrderButton } from '../auth/OrderButton'
import { ScrollReveal } from '../ui/ScrollReveal'

export function CTABanner() {
  return (
    <section className="section-padding">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="relative overflow-hidden rounded-3xl border border-accent-violet/20 p-8 sm:p-12 lg:p-16"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent-violet/20 via-accent-purple/10 to-accent-cyan/10" />
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-accent-violet/20 blur-[80px]" />
            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-accent-cyan/15 blur-[80px]" />

            <div className="relative text-center">
              <h2 className="font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Ready to Get Started?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-white/60">
                Browse our premium catalog and order in minutes. Fast delivery,
                trusted service, unbeatable prices.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <GradientButton to="/shop" size="lg">
                  Shop Now
                  <ArrowRight className="h-5 w-5" />
                </GradientButton>
                <OrderButton variant="outline" size="lg">
                  Place an Order
                </OrderButton>
              </div>
            </div>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  )
}
