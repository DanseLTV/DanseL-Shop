import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal } from 'lucide-react'
import { products } from '../data/products'
import type { Product } from '../types'
import { useOrderNavigation } from '../hooks/useOrderNavigation'
import { ScrollReveal } from '../components/ui/ScrollReveal'
import { SectionHeading } from '../components/ui/SectionHeading'
import { AnimatedBackground } from '../components/ui/AnimatedBackground'
import { ProductCard } from '../components/shop/ProductCard'
import { ProductDetailModal } from '../components/shop/ProductDetailModal'
import { OrderGuide } from '../components/shop/OrderGuide'

const categories = ['All', ...new Set(products.map((p) => p.category))]

export function ShopPage() {
  const [searchParams] = useSearchParams()
  const goToOrder = useOrderNavigation()
  const initialCategory = searchParams.get('category') || 'All'

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(initialCategory)

  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat) setCategory(cat)
  }, [searchParams])
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc'>('name')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const filtered = products
    .filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = category === 'All' || p.category === category
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price
      if (sortBy === 'price-desc') return b.price - a.price
      return a.name.localeCompare(b.name)
    })

  const handleOrder = (product: Product) => {
    setSelectedProduct(null)
    goToOrder(product.id, product)
  }

  return (
    <div className="relative min-h-screen pt-24">
      <AnimatedBackground />

      <div className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeading
            badge="DANSEL SHOP"
            title="Browse & Order"
            subtitle="Pick a product below. Sign in only when you’re ready to checkout."
          />
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
          <OrderGuide />
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1 lg:max-w-md">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder-white/40 backdrop-blur-sm transition-colors focus:border-accent-violet/50 focus:outline-none focus:ring-1 focus:ring-accent-violet/30"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-white/50">
                <SlidersHorizontal className="h-4 w-4" />
                Sort:
              </div>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as 'name' | 'price-asc' | 'price-desc')
                }
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white backdrop-blur-sm focus:border-accent-violet/50 focus:outline-none"
              >
                <option value="name" className="bg-midnight-900">
                  Name A–Z
                </option>
                <option value="price-asc" className="bg-midnight-900">
                  Price: Low to High
                </option>
                <option value="price-desc" className="bg-midnight-900">
                  Price: High to Low
                </option>
              </select>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  category === cat
                    ? 'bg-gradient-to-r from-accent-violet to-accent-purple text-white shadow-glow'
                    : 'border border-white/10 bg-white/5 text-white/60 hover:border-accent-violet/30 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {filtered.length === 0 ? (
          <div className="glass-card py-16 text-center">
            <p className="text-lg text-white/60">No products found.</p>
            <p className="mt-2 text-sm text-white/40">
              Try adjusting your search or filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product, i) => (
              <ScrollReveal key={product.id} delay={i * 0.05}>
                <ProductCard
                  product={product}
                  index={i}
                  onViewDetails={setSelectedProduct}
                  onOrder={handleOrder}
                />
              </ScrollReveal>
            ))}
          </div>
        )}

        <p className="mt-8 text-center text-sm text-white/40">
          Showing {filtered.length} of {products.length} products
        </p>
      </div>

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onOrder={handleOrder}
      />
    </div>
  )
}
