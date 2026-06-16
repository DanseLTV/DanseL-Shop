import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, Package, ShoppingBag } from 'lucide-react'
import type { Product } from '../types'
import { useOrderNavigation } from '../hooks/useOrderNavigation'
import { useCart } from '../context/CartContext'
import { ScrollReveal } from '../components/ui/ScrollReveal'
import { AnimatedBackground } from '../components/ui/AnimatedBackground'
import { CustomerPageHeader } from '../components/layout/CustomerPageHeader'
import { ProductCard } from '../components/shop/ProductCard'
import { ProductDetailModal } from '../components/shop/ProductDetailModal'
import { OrderGuide } from '../components/shop/OrderGuide'
import { ShopProductCarousel } from '../components/shop/ShopProductCarousel'
import { useProducts } from '../hooks/useProducts'
import { ProductGridSkeleton } from '../components/shop/ProductGridSkeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { MyOrdersStrip } from '../components/order/MyOrdersStrip'
import { ToastBanner } from '../components/ui/ToastBanner'

export function ShopPage() {
  const { products: liveProducts, loading: productsLoading } = useProducts()
  const { addItem, getQuantity } = useCart()
  const [searchParams, setSearchParams] = useSearchParams()
  const goToOrder = useOrderNavigation()
  const [cartToast, setCartToast] = useState<string | null>(null)
  const initialCategory = searchParams.get('category') || 'All'

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(initialCategory)
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc'>('name')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const minPrice = liveProducts.length ? Math.min(...liveProducts.map((p) => p.price)) : 0

  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat) setCategory(cat)
  }, [searchParams])

  useEffect(() => {
    const productId = searchParams.get('product')
    if (!productId || productsLoading) return
    const product = liveProducts.find((p) => p.id === productId)
    if (product) setSelectedProduct(product)
  }, [searchParams, liveProducts, productsLoading])

  const closeProductModal = useCallback(() => {
    setSelectedProduct(null)
    if (searchParams.has('product')) {
      const next = new URLSearchParams(searchParams)
      next.delete('product')
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, setSearchParams])

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
      liveProducts
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
    [liveProducts, search, category, sortBy]
  )

  const focusProduct = useCallback(
    (product: Product) => {
      const next = new URLSearchParams(searchParams)
      next.set('product', product.id)
      setSearchParams(next, { replace: true })
      setSelectedProduct(product)
    },
    [searchParams, setSearchParams]
  )

  const handleOrder = (product: Product) => {
    setSelectedProduct(null)
    goToOrder(product.id, product)
  }

  const handleAddToCart = useCallback(
    (product: Product) => {
      if (product.availability === 'Out of Stock') return
      addItem(product.id)
      setCartToast(`${product.name} added to cart`)
      setSelectedProduct(null)
    },
    [addItem]
  )

  return (
    <div className="relative min-h-screen pt-20 pb-24 lg:pb-20">
      <AnimatedBackground />

      {cartToast && (
        <ToastBanner
          message={cartToast}
          variant="success"
          onDismiss={() => setCartToast(null)}
        />
      )}

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <CustomerPageHeader
            badge="Home"
            title={
              <>
                Premium digital <span className="gradient-text">subscriptions</span>
              </>
            }
            subtitle={`Browse ${liveProducts.length} products — your orders and status appear above when signed in.`}
          />
        </ScrollReveal>

        <ScrollReveal delay={0.04}>
          <MyOrdersStrip className="mb-6" />
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
          <ShopProductCarousel onProductSelect={focusProduct} />
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
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/35 backdrop-blur-sm transition-colors focus:border-brand/50 focus:outline-none focus:ring-1 focus:ring-brand/30"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="text-caption hidden items-center gap-2 sm:flex">
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
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white backdrop-blur-sm focus:border-brand/50 focus:outline-none"
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

          <div className="mt-4 flex gap-2 scroll-x pb-1 scrollbar-thin">
            {['All', ...new Set(liveProducts.map((p) => p.category))].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  category === cat
                    ? 'bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-magenta text-midnight-950 shadow-neon-cyan'
                    : 'border border-white/10 bg-white/5 text-white/60 hover:border-neon-cyan/40 hover:text-neon-cyan hover:shadow-neon-cyan'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {productsLoading ? (
          <ProductGridSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="h-7 w-7" />}
            title="No products found"
            description="Try a different search or category, or clear your filters."
            actionLabel="Clear filters"
            onAction={() => {
              setSearch('')
              setCategoryFilter('All')
            }}
          />
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:gap-3 lg:gap-4 xl:gap-5">
            {filtered.map((product, i) => (
              <ScrollReveal key={product.id} delay={Math.min(i * 0.04, 0.24)}>
                <div id={`shop-product-${product.id}`} className="scroll-mt-28">
                  <ProductCard
                    product={product}
                    index={i}
                    onViewDetails={setSelectedProduct}
                    onOrder={handleOrder}
                    onAddToCart={handleAddToCart}
                    cartQuantity={getQuantity(product.id)}
                  />
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}

        <p className="text-caption mt-10 text-center">
          {filtered.length} of {liveProducts.length} products · from ₱{minPrice}
        </p>
      </div>

      <ProductDetailModal
        product={selectedProduct}
        onClose={closeProductModal}
        onOrder={handleOrder}
        onAddToCart={handleAddToCart}
        cartQuantity={selectedProduct ? getQuantity(selectedProduct.id) : 0}
      />
    </div>
  )
}
