export interface Product {
  id: string
  name: string
  category: string
  description: string
  price: number
  duration: string
  availability: 'In Stock' | 'Limited' | 'Out of Stock'
  featured: boolean
  badge?: string
  features: string[]
  imageGradient: string
  /** Path sa public/ — hal. /products/netflix-premium.png */
  image?: string
}

export interface Review {
  id: string
  name: string
  product: string
  rating: number
  comment: string
  date: string
  verified: boolean
}

export interface FAQItem {
  id: string
  question: string
  answer: string
}

export interface PolicySection {
  id: string
  title: string
  content: string[]
}

export interface Category {
  id: string
  name: string
  icon: string
  description: string
  count: number
}

export type PaymentMethod = 'GCash' | 'Maya' | 'Bank Transfer' | 'PayPal'
