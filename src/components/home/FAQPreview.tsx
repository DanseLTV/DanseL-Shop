import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { faqItems } from '../../data/faq'
import { ScrollReveal } from '../ui/ScrollReveal'
import { SectionHeading } from '../ui/SectionHeading'
import { FAQAccordion } from '../faq/FAQAccordion'

export function FAQPreview() {
  return (
    <section id="faq" className="section-padding relative">
      <div className="mx-auto max-w-3xl">
        <ScrollReveal>
          <SectionHeading
            badge="FAQ"
            title="Frequently Asked Questions"
            subtitle="Quick answers to common questions. Can't find what you need? Contact us anytime."
          />
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <FAQAccordion items={faqItems} limit={4} />
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="mt-8 text-center">
            <Link
              to="/policies"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand transition-colors hover:text-brand-bright"
            >
              View all policies & full FAQ
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
