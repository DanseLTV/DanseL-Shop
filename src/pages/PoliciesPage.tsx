import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { policySections } from '../data/policies'
import { faqItems } from '../data/faq'
import { ScrollReveal } from '../components/ui/ScrollReveal'
import { SectionHeading } from '../components/ui/SectionHeading'
import { FAQAccordion } from '../components/faq/FAQAccordion'
import { AnimatedBackground } from '../components/ui/AnimatedBackground'

export function PoliciesPage() {
  return (
    <div className="relative min-h-screen pt-24">
      <AnimatedBackground />

      <div className="relative mx-auto max-w-4xl px-4 pb-20 sm:px-6 lg:px-8">
        <Link
          to="/home"
          className="mb-6 inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-accent-violet"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <ScrollReveal>
          <SectionHeading
            badge="Legal"
            title="Policies & Terms"
            subtitle="Everything you need to know about ordering, replacements, refunds, and your responsibilities."
            align="left"
          />
        </ScrollReveal>

        <div className="space-y-8">
          {policySections.map((section, i) => (
            <ScrollReveal key={section.id} delay={i * 0.08}>
              <article
                id={section.id}
                className="glass-card scroll-mt-28 p-6 sm:p-8"
              >
                <h2 className="font-display text-2xl font-bold text-white">
                  {section.title}
                </h2>
                <ul className="mt-4 space-y-3">
                  {section.content.map((paragraph, j) => (
                    <li
                      key={j}
                      className="flex gap-3 text-sm leading-relaxed text-white/60"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-violet" />
                      {paragraph}
                    </li>
                  ))}
                </ul>
              </article>
            </ScrollReveal>
          ))}
        </div>

        <div className="mt-16">
          <ScrollReveal>
            <SectionHeading
              badge="FAQ"
              title="Full FAQ"
              subtitle="All frequently asked questions in one place."
              align="left"
            />
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <FAQAccordion items={faqItems} />
          </ScrollReveal>
        </div>
      </div>
    </div>
  )
}
