import type { Product } from '../types'
import { shopConfig } from './shopConfig'
import { productCatalog, priceOverrides } from './productCatalog'
import { categoryMeta } from './categoryMeta'

/** Default image path — palitan ang .png file sa public/products/ (same filename) */
export const getProductImagePath = (id: string) => `/products/${id}.svg`

/** Converts catalog entries → products shown on the site */
function toProduct(entry: (typeof productCatalog)[number]): Product {
  const price = priceOverrides[entry.id] ?? entry.price

  return {
    id: entry.id,
    name: entry.name,
    category: entry.category,
    description: entry.description,
    price,
    duration: entry.duration || shopConfig.defaultDuration,
    availability: entry.availability,
    featured: entry.featured,
    badge: entry.badge,
    features: entry.features,
    imageGradient: entry.gradient,
    image: entry.image ?? getProductImagePath(entry.id),
  }
}

/** All active products (enabled !== false) */
export const products: Product[] = productCatalog
  .filter((p) => p.enabled !== false)
  .map(toProduct)

export const getProductById = (id: string) => products.find((p) => p.id === id)

export const getFeaturedProducts = () => products.filter((p) => p.featured)

export const formatPrice = (amount: number) =>
  `${shopConfig.currencySymbol}${amount.toLocaleString('en-PH')}`

export const getCategories = () => {
  const counts = products.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1
    return acc
  }, {})

  return Object.entries(counts).map(([name, count]) => {
    const meta = categoryMeta[name] ?? {
      icon: '📦',
      description: `${name} products`,
    }
    return {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      icon: meta.icon,
      description: meta.description,
      count,
    }
  })
}
