import { productCatalog } from '../data/productCatalog'
import { resolveProductImageUrl } from '../data/productImages'
import { shopConfig } from '../data/shopConfig'
import type { ShopProductRow } from './shopProductMapper'

/** Default catalog rows for first-time DB import (admin "Import catalog" button). */
export function buildDefaultShopProductRows(): Omit<ShopProductRow, 'updated_by' | 'updated_at' | 'created_at'>[] {
  return productCatalog.map((entry, index) => ({
    id: entry.id,
    name: entry.name,
    category: entry.category,
    description: entry.description,
    price: entry.price,
    duration: entry.duration || shopConfig.defaultDuration,
    availability: entry.availability,
    featured: entry.featured,
    badge: entry.badge ?? null,
    features: entry.features,
    image_gradient: entry.gradient,
    image: entry.image ?? resolveProductImageUrl(entry.id),
    image_fit: entry.imageFit ?? 'cover',
    enabled: entry.enabled !== false,
    sort_order: index,
  }))
}
