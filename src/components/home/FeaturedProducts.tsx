import { useState, useCallback } from 'react'
import type { Product } from '../../types'
import { useOrderNavigation } from '../../hooks/useOrderNavigation'
import { useCart } from '../../context/CartContext'
import { useGuardedAddToCart } from '../../hooks/useGuardedAddToCart'
import { ScrollReveal } from '../ui/ScrollReveal'
import { SectionHeading } from '../ui/SectionHeading'
import { GradientButton } from '../ui/GradientButton'
import { ProductCard } from '../shop/ProductCard'
import { ProductDetailModal } from '../shop/ProductDetailModal'
import { useProducts } from '../../hooks/useProducts'
import { ToastBanner } from '../ui/ToastBanner'

export function FeaturedProducts() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [cartToast, setCartToast] = useState<string | null>(null)
  const goToOrder = useOrderNavigation()
  const { getQuantity } = useCart()
  const addToCart = useGuardedAddToCart()
  const { products } = useProducts()
  const featured = products.filter((p) => p.featured)

  const handleOrder = (product: Product) => {
    setSelectedProduct(null)
    goToOrder(product.id, product)
  }

  const handleAddToCart = useCallback(
    (product: Product) => {
      if (addToCart(product)) {
        setCartToast(`${product.name} added to cart`)
        setSelectedProduct(null)
      }
    },
    [addToCart]
  )

  return (
    <section className="section-padding relative">
      {cartToast && (
        <ToastBanner
          message={cartToast}
          variant="success"
          onDismiss={() => setCartToast(null)}
        />
      )}
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
                onAddToCart={handleAddToCart}
                cartQuantity={getQuantity(product.id)}
              />
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.3}>
          <div className="mt-12 text-center">
            <GradientButton to="/shop" variant="outline">
              View All Products
            </GradientButton>
          </div>
        </ScrollReveal>
      </div>

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onOrder={handleOrder}
        onAddToCart={handleAddToCart}
        cartQuantity={selectedProduct ? getQuantity(selectedProduct.id) : 0}
      />
    </section>
  )
}
