import { useState } from 'react'
import type { Product } from '../../types'
import { getFeaturedProducts } from '../../data/products'
import { useOrderNavigation } from '../../hooks/useOrderNavigation'
import { ScrollReveal } from '../ui/ScrollReveal'
import { SectionHeading } from '../ui/SectionHeading'
import { GradientButton } from '../ui/GradientButton'
import { ProductCard } from '../shop/ProductCard'
import { ProductDetailModal } from '../shop/ProductDetailModal'

export function FeaturedProducts() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const goToOrder = useOrderNavigation()
  const featured = getFeaturedProducts()

  const handleOrder = (product: Product) => {
    setSelectedProduct(null)
    goToOrder(product.id, product)
  }

  return (
    <section className="section-padding relative">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <SectionHeading
            badge="Featured"
            title="Premium Accounts, Best Prices"
            subtitle="Hand-picked premium subscriptions with the best value. All verified, all ready to deliver."
          />
        </ScrollReveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product, i) => (
            <ScrollReveal key={product.id} delay={i * 0.08}>
              <ProductCard
                product={product}
                index={i}
                onViewDetails={setSelectedProduct}
                onOrder={handleOrder}
              />
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.3}>
          <div className="mt-12 text-center">
            <GradientButton to="/" variant="outline">
              View All Products
            </GradientButton>
          </div>
        </ScrollReveal>
      </div>

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onOrder={handleOrder}
      />
    </section>
  )
}
