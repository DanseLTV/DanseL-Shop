import { policySections } from '../data/policies'
import { faqItems } from '../data/faq'
import { ScrollReveal } from '../components/ui/ScrollReveal'
import { SectionHeading } from '../components/ui/SectionHeading'
import { FAQAccordion } from '../components/faq/FAQAccordion'
import { CustomerPageHeader } from '../components/layout/CustomerPageHeader'

export function PoliciesPage() {
  return (
    <div className="relative min-h-screen pt-20 pb-20">
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <CustomerPageHeader
          backTo="/shop"
          backLabel="Back to home"
          badge="Legal"
          title="Policies & Terms"
          subtitle="Everything you need to know about ordering, replacements, refunds, and your responsibilities."
        />

        <div className="hidden lg:block">
          <nav
            aria-label="Policy sections"
            className="sticky top-24 z-20 mb-8 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-midnight-900/80 p-3 backdrop-blur-xl"
          >
            {policySections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                {section.title}
              </a>
            ))}
          </nav>
        </div>

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
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300/80" />
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
