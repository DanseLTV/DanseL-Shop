import type { Product } from '../types'
import { resolveProductImageUrl } from '../data/productImages'
import { shopConfig } from '../data/shopConfig'

export interface ShopProductRow {
  id: string
  name: string
  category: string
  description: string
  price: number
  duration: string
  availability: Product['availability']
  featured: boolean
  badge: string | null
  features: string[]
  image_gradient: string
  image: string | null
  image_fit: Product['imageFit']
  enabled: boolean
  sort_order: number
  updated_by?: string | null
  updated_at?: string
  created_at?: string
}

export interface ProductFormState {
  id: string
  name: string
  category: string
  description: string
  price: string
  duration: string
  availability: Product['availability']
  featured: boolean
  badge: string
  featuresText: string
  imageGradient: string
  image: string
  imageFit: Product['imageFit']
  enabled: boolean
  sortOrder: string
}

export const PRODUCT_CATEGORIES = ['Streaming', 'AI Tools', 'Writing Tools'] as const

export const BADGE_OPTIONS = ['', 'Popular', 'Best Value', 'Premium', 'Hot'] as const

export const GRADIENT_PRESETS = [
  'from-blue-700 via-indigo-600 to-purple-700',
  'from-blue-600 via-indigo-500 to-violet-600',
  'from-indigo-600 via-blue-600 to-purple-600',
  'from-green-600 via-emerald-500 to-teal-600',
  'from-blue-500 via-sky-500 to-cyan-500',
  'from-pink-500 via-fuchsia-500 to-purple-600',
  'from-yellow-500 via-amber-500 to-orange-500',
  'from-purple-800 via-violet-700 to-indigo-800',
  'from-violet-700 via-purple-700 to-fuchsia-800',
  'from-indigo-800 via-purple-700 to-violet-800',
  'from-purple-900 via-violet-800 to-black',
  'from-sky-500 via-blue-600 to-cyan-600',
  'from-blue-500 via-indigo-500 to-blue-700',
  'from-teal-500 via-green-500 to-emerald-600',
  'from-emerald-500 via-green-600 to-teal-600',
  'from-emerald-500 via-teal-500 to-cyan-500',
  'from-cyan-500 via-teal-400 to-green-500',
] as const

export function slugifyProductId(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
}

export function parseFeaturesText(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

export function featuresToText(features: string[]): string {
  return features.join('\n')
}

export function shopRowToProduct(row: ShopProductRow): Product {
  const image = row.image?.trim() || resolveProductImageUrl(row.id)
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description,
    price: Number(row.price),
    duration: row.duration || shopConfig.defaultDuration,
    availability: row.availability,
    featured: row.featured,
    badge: row.badge?.trim() || undefined,
    features: Array.isArray(row.features) ? row.features : [],
    imageGradient: row.image_gradient,
    image,
    imageFit: row.image_fit ?? 'cover',
  }
}

export function productToForm(
  product: Product,
  extras?: {
    enabled?: boolean
    sortOrder?: number
    /** Stored DB image (if set); merged `product.image` wins when it is a custom upload */
    storedImage?: string | null
    imageFit?: Product['imageFit']
  }
): ProductFormState {
  const stored = extras?.storedImage?.trim() ?? ''
  const merged = product.image?.trim() ?? ''
  const mergedIsCustom = merged.length > 0 && !merged.startsWith('/products/')
  const storedIsCustom = stored.length > 0 && !stored.startsWith('/products/')
  const image =
    mergedIsCustom ? merged : storedIsCustom ? stored : merged || stored

  return {
    id: product.id,
    name: product.name,
    category: product.category,
    description: product.description,
    price: String(product.price),
    duration: product.duration,
    availability: product.availability,
    featured: product.featured,
    badge: product.badge ?? '',
    featuresText: featuresToText(product.features),
    imageGradient: product.imageGradient,
    image,
    imageFit: extras?.imageFit ?? product.imageFit ?? 'cover',
    enabled: extras?.enabled ?? true,
    sortOrder: String(extras?.sortOrder ?? 0),
  }
}

/** Live customer preview — mirrors what the shop card will show. */
export function buildPreviewProduct(
  form: ProductFormState,
  fallback?: Product | null
): Product {
  const id = form.id.trim() || fallback?.id || 'preview'
  const formImage = form.image.trim()
  const fallbackImage = fallback?.image?.trim() ?? ''
  const image =
    formImage ||
    fallbackImage ||
    (id !== 'preview' ? resolveProductImageUrl(id) : undefined)

  return {
    id,
    name: form.name.trim() || fallback?.name || 'New Product',
    category: form.category.trim() || fallback?.category || 'Streaming',
    description: form.description.trim() || fallback?.description || '',
    price: form.price.trim() ? Number(form.price) : fallback?.price ?? 0,
    duration: form.duration.trim() || fallback?.duration || shopConfig.defaultDuration,
    availability: form.availability,
    featured: form.featured,
    badge: form.badge.trim() || undefined,
    features: parseFeaturesText(form.featuresText),
    imageGradient: form.imageGradient.trim() || fallback?.imageGradient || GRADIENT_PRESETS[0],
    image,
    imageFit: form.imageFit,
  }
}

export function emptyProductForm(): ProductFormState {
  return {
    id: '',
    name: '',
    category: PRODUCT_CATEGORIES[0],
    description: '',
    price: '',
    duration: shopConfig.defaultDuration,
    availability: 'In Stock',
    featured: false,
    badge: '',
    featuresText: 'Fast Delivery\nReplacement Guarantee\nVerified Access',
    imageGradient: GRADIENT_PRESETS[0],
    image: '',
    imageFit: 'cover',
    enabled: true,
    sortOrder: '0',
  }
}

export function formToShopPayload(
  form: ProductFormState,
  updatedBy?: string
): Omit<ShopProductRow, 'created_at' | 'updated_at'> {
  const priceNum = Number(form.price)
  return {
    id: form.id.trim(),
    name: form.name.trim(),
    category: form.category.trim(),
    description: form.description.trim(),
    price: Number.isNaN(priceNum) ? 0 : priceNum,
    duration: form.duration.trim() || shopConfig.defaultDuration,
    availability: form.availability,
    featured: form.featured,
    badge: form.badge.trim() || null,
    features: parseFeaturesText(form.featuresText),
    image_gradient: form.imageGradient.trim() || GRADIENT_PRESETS[0],
    image: form.image.trim() || null,
    image_fit: form.imageFit,
    enabled: form.enabled,
    sort_order: Number(form.sortOrder) || 0,
    ...(updatedBy ? { updated_by: updatedBy } : {}),
  }
}

export function validateProductForm(form: ProductFormState, isCreate: boolean): string | null {
  if (isCreate && !form.id.trim()) return 'Product ID is required (e.g. netflix-shared).'
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.id.trim())) {
    return 'Product ID must be lowercase letters, numbers, and hyphens only.'
  }
  if (!form.name.trim()) return 'Name is required.'
  if (!form.category.trim()) return 'Category is required.'
  if (!form.price.trim() || Number.isNaN(Number(form.price)) || Number(form.price) < 0) {
    return 'Price must be a valid non-negative number.'
  }
  if (!form.description.trim()) return 'Description is required.'
  return null
}
