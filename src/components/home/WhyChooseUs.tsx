import {
  Shield,
  Zap,
  BadgeDollarSign,
  RefreshCw,
  Headphones,
  LayoutGrid,
} from 'lucide-react'
import { whyChooseUs } from '../../data/site'
import { ScrollReveal } from '../ui/ScrollReveal'
import { SectionHeading } from '../ui/SectionHeading'
import { GlassCard } from '../ui/GlassCard'

const iconMap = {
  Shield,
  Zap,
  BadgeDollarSign,
  RefreshCw,
  Headphones,
  LayoutGrid,
}

export function WhyChooseUs() {
  return (
    <section className="section-padding relative">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <SectionHeading
            badge="Why Us"
            title="Why Choose DANSEL SHOP?"
            subtitle="We built this shop around trust, speed, and value — so you can order with confidence every time."
          />
        </ScrollReveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {whyChooseUs.map((item, i) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap]
            return (
              <ScrollReveal key={item.title} delay={i * 0.08}>
                <GlassCard hover className="h-full p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-200/15">
                    <Icon className="h-6 w-6 text-amber-200" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">
                    {item.description}
                  </p>
                </GlassCard>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
