import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, Package } from 'lucide-react'
import { products } from '../data/products'
import type { Product } from '../types'
import { useOrderNavigation } from '../hooks/useOrderNavigation'
import { ScrollReveal } from '../components/ui/ScrollReveal'
import { AnimatedBackground } from '../components/ui/AnimatedBackground'
import { ProductCard } from '../components/shop/ProductCard'
import { ProductDetailModal } from '../components/shop/ProductDetailModal'
import { OrderGuide } from '../components/shop/OrderGuide'
import { ShopTrustStrip } from '../components/shop/ShopTrustStrip'

const categories = ['All', ...new Set(products.map((p) => p.category))]

const minPrice = Math.min(...products.map((p) => p.price))

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const goToOrder = useOrderNavigation()
  const initialCategory = searchParams.get('category') || 'All'

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(initialCategory)
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc'>('name')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat) setCategory(cat)
  }, [searchParams])

  const setCategoryFilter = (cat: string) => {
    setCategory(cat)
    if (cat === 'All') {
      searchParams.delete('category')
      setSearchParams(searchParams, { replace: true })
    } else {
      setSearchParams({ category: cat }, { replace: true })
    }
  }

  const filtered = useMemo(
    () =>
      products
        .filter((p) => {
          const q = search.toLowerCase()
          const matchesSearch =
            !q ||
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
          const matchesCategory = category === 'All' || p.category === category
          return matchesSearch && matchesCategory
        })
        .sort((a, b) => {
          if (sortBy === 'price-asc') return a.price - b.price
          if (sortBy === 'price-desc') return b.price - a.price
          return a.name.localeCompare(b.name)
        }),
    [search, category, sortBy]
  )

  const handleOrder = (product: Product) => {
    setSelectedProduct(null)
    goToOrder(product.id, product)
  }

  return (
    <div className="relative min-h-screen pt-20 pb-24 lg:pb-20">
      <AnimatedBackground />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="pb-6 pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent-violet">
              DANSEL SHOP
            </p>
            <h1 className="font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Premium digital{' '}
              <span className="gradient-text">subscriptions</span>
            </h1>
            <p className="mt-3 max-w-2xl text-base text-white/55 sm:text-lg">
              Browse {products.length} products — sign in only when you&apos;re ready to checkout.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
          <ShopTrustStrip />
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
          <OrderGuide />
        </ScrollReveal>

        {/* Sticky toolbar */}
        <div className="sticky top-[4.25rem] z-30 -mx-4 mb-6 border-b border-white/10 bg-midnight-950/85 px-4 py-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:top-[4.5rem]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1 lg:max-w-md">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                type="search"
                placeholder="Search streaming, AI, writing tools…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder-white/40 backdrop-blur-sm transition-colors focus:border-accent-violet/50 focus:outline-none focus:ring-1 focus:ring-accent-violet/30"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="hidden items-center gap-2 text-sm text-white/45 sm:flex">
                <Package className="h-4 w-4" />
                {filtered.length} shown
              </div>
              <div className="flex items-center gap-2 text-sm text-white/50">
                <SlidersHorizontal className="h-4 w-4" />
                Sort
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
                  Price: Low → High
                </option>
                <option value="price-desc" className="bg-midnight-900">
                  Price: High → Low
                </option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  category === cat
                    ? 'bg-gradient-to-r from-accent-violet to-accent-purple text-white shadow-glow'
                    : 'border border-white/10 bg-white/5 text-white/60 hover:border-accent-violet/30 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="glass-card py-16 text-center">
            <p className="text-lg text-white/60">No products found.</p>
            <p className="mt-2 text-sm text-white/40">
              Try a different search or category.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setCategoryFilter('All')
              }}
              className="mt-6 text-sm font-medium text-accent-violet hover:text-accent-cyan"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((product, i) => (
              <ScrollReveal key={product.id} delay={Math.min(i * 0.04, 0.24)}>
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

        <p className="mt-10 text-center text-sm text-white/40">
          {filtered.length} of {products.length} products · from ₱{minPrice}
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
