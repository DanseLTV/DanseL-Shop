import { orderSteps } from '../../data/site'
import { ScrollReveal } from '../ui/ScrollReveal'
import { SectionHeading } from '../ui/SectionHeading'

export function HowToOrder() {
  return (
    <section id="how-to-order" className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 mesh-bg opacity-30" />
      <div className="relative mx-auto max-w-7xl">
        <ScrollReveal>
          <SectionHeading
            badge="Easy Process"
            title="How to Order"
            subtitle="Four simple steps from browsing to enjoying your premium access."
          />
        </ScrollReveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {orderSteps.map((step, i) => (
            <ScrollReveal key={step.step} delay={i * 0.1}>
              <div className="relative">
                {i < orderSteps.length - 1 && (
                  <div className="absolute left-1/2 top-8 hidden h-0.5 w-full bg-gradient-to-r from-brand/50 to-transparent lg:block" />
                )}
                <div className="glass-card relative h-full p-6 text-center">
                  <span className="inline-block font-display text-3xl font-bold gradient-text">
                    {step.step}
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-white/50">{step.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
