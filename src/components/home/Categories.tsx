import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { getCategories } from '../../data/products'
import { ScrollReveal } from '../ui/ScrollReveal'
import { SectionHeading } from '../ui/SectionHeading'
import { GlassCard } from '../ui/GlassCard'

export function Categories() {
  const categories = getCategories()

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 mesh-bg opacity-20" />
      <div className="relative mx-auto max-w-7xl">
        <ScrollReveal>
          <SectionHeading
            badge="Categories"
            title="Find What You Need"
            subtitle="Browse by category — streaming, productivity, AI tools, and more."
          />
        </ScrollReveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {categories.map((cat, i) => (
            <ScrollReveal key={cat.id} delay={i * 0.08}>
              <Link to={`/shop?category=${encodeURIComponent(cat.name)}`}>
                <GlassCard hover className="group h-full p-6 text-center">
                  <span className="text-4xl">{cat.icon}</span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-white group-hover:text-accent-violet transition-colors">
                    {cat.name}
                  </h3>
                  <p className="mt-2 text-sm text-white/50">{cat.description}</p>
                  <p className="mt-3 text-xs font-medium text-accent-violet">
                    {cat.count} products
                  </p>
                  <ArrowRight className="mx-auto mt-4 h-4 w-4 text-white/30 transition-all group-hover:translate-x-1 group-hover:text-accent-violet" />
                </GlassCard>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
