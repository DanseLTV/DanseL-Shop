/**
 * ═══════════════════════════════════════════════════════════════════
 *  DANSEL SHOP — PRODUCT CATALOG
 * ═══════════════════════════════════════════════════════════════════
 */

import type { Product } from '../types'

export const priceOverrides: Partial<Record<string, number>> = {}

export type CatalogEntry = Omit<Product, 'imageGradient' | 'image'> & {
  gradient: string
  image?: string
  enabled?: boolean
}

const sharedFeatures = ['Fast Delivery', 'Replacement Guarantee', 'Verified Access']

export const productCatalog: CatalogEntry[] = [
  // ─── DISNEY+ ─────────────────────────────────────────────────────
  {
    id: 'disney-plus-shared',
    name: 'Disney+',
    category: 'Streaming',
    price: 55,
    duration: '30 Days',
    availability: 'In Stock',
    featured: true,
    badge: 'Popular',
    description:
      'Shared Disney+ access — Marvel, Star Wars, Pixar, and exclusive Disney content. Affordable premium streaming for everyday entertainment.',
    features: ['Shared Access', 'HD Streaming', 'Disney+ Library', ...sharedFeatures],
    gradient: 'from-blue-700 via-indigo-600 to-purple-700',
  },
  {
    id: 'disney-plus-solo-1',
    name: 'Disney+ Solo Profile / 1 Device',
    category: 'Streaming',
    price: 65,
    duration: '30 Days',
    availability: 'In Stock',
    featured: false,
    description:
      'Dedicated solo profile on Disney+ for one device. More privacy and stability than shared access.',
    features: ['Solo Profile', '1 Device', 'HD Streaming', ...sharedFeatures],
    gradient: 'from-blue-600 via-indigo-500 to-violet-600',
  },
  {
    id: 'disney-plus-solo-2',
    name: 'Disney+ Solo Profile / 2 Devices',
    category: 'Streaming',
    price: 75,
    duration: '30 Days',
    availability: 'In Stock',
    featured: false,
    description:
      'Solo Disney+ profile with access on up to 2 devices. Great for personal use across phone and TV.',
    features: ['Solo Profile', '2 Devices', 'HD Streaming', ...sharedFeatures],
    gradient: 'from-indigo-600 via-blue-600 to-purple-600',
  },

  // ─── STREAMING (REGIONAL & GLOBAL) ───────────────────────────────
  {
    id: 'iqiyi-shared',
    name: 'iQIYI Shared',
    category: 'Streaming',
    price: 50,
    duration: '30 Days',
    availability: 'In Stock',
    featured: false,
    description:
      'Shared iQIYI premium access for Asian dramas, movies, and exclusive series at an affordable price.',
    features: ['Shared Access', 'Asian Content', 'HD Quality', ...sharedFeatures],
    gradient: 'from-green-600 via-emerald-500 to-teal-600',
  },
  {
    id: 'iwanttfc-shared',
    name: 'iWantTFC Shared',
    category: 'Streaming',
    price: 50,
    duration: '30 Days',
    availability: 'In Stock',
    featured: false,
    description:
      'Shared iWantTFC access for Filipino shows, live channels, and exclusive ABS-CBN content.',
    features: ['Shared Access', 'Pinoy Content', 'Live & On-Demand', ...sharedFeatures],
    gradient: 'from-blue-500 via-sky-500 to-cyan-500',
  },
  {
    id: 'wow-presents-shared',
    name: 'WOW Presents Shared',
    category: 'Streaming',
    price: 60,
    duration: '30 Days',
    availability: 'In Stock',
    featured: false,
    description:
      'Shared WOW Presents Plus access for drag, reality, and exclusive World of Wonder content.',
    features: ['Shared Access', 'Exclusive Shows', 'HD Streaming', ...sharedFeatures],
    gradient: 'from-pink-500 via-fuchsia-500 to-purple-600',
  },
  {
    id: 'viu-shared',
    name: 'Viu Shared',
    category: 'Streaming',
    price: 40,
    duration: '30 Days',
    availability: 'In Stock',
    featured: true,
    badge: 'Best Value',
    description:
      'Shared Viu premium — K-dramas, Asian series, and movies at our lowest streaming price.',
    features: ['Shared Access', 'K-Drama & Asian Hits', 'HD Quality', ...sharedFeatures],
    gradient: 'from-yellow-500 via-amber-500 to-orange-500',
  },

  // ─── HBO ─────────────────────────────────────────────────────────
  {
    id: 'hbo-shared',
    name: 'HBO Shared Profile',
    category: 'Streaming',
    price: 60,
    duration: '30 Days',
    availability: 'In Stock',
    featured: true,
    description:
      'Shared HBO profile for blockbuster movies, HBO originals, and premium series.',
    features: ['Shared Profile', 'HBO Originals', 'HD Streaming', ...sharedFeatures],
    gradient: 'from-purple-800 via-violet-700 to-indigo-800',
  },
  {
    id: 'hbo-solo-1',
    name: 'HBO Solo Profile / 1 Device',
    category: 'Streaming',
    price: 70,
    duration: '30 Days',
    availability: 'In Stock',
    featured: false,
    description:
      'Dedicated HBO solo profile for one device — more control and fewer interruptions.',
    features: ['Solo Profile', '1 Device', 'HBO Max Library', ...sharedFeatures],
    gradient: 'from-violet-700 via-purple-700 to-fuchsia-800',
  },
  {
    id: 'hbo-solo-2',
    name: 'HBO Solo Profile / 2 Devices',
    category: 'Streaming',
    price: 75,
    duration: '30 Days',
    availability: 'In Stock',
    featured: false,
    description:
      'HBO solo profile with streaming on up to 2 devices. Ideal for phone and smart TV.',
    features: ['Solo Profile', '2 Devices', 'Premium Series', ...sharedFeatures],
    gradient: 'from-indigo-800 via-purple-700 to-violet-800',
  },
  {
    id: 'hbo-solo-account',
    name: 'HBO Solo Account',
    category: 'Streaming',
    price: 185,
    duration: '30 Days',
    availability: 'Limited',
    featured: true,
    badge: 'Premium',
    description:
      'Full solo HBO account — maximum privacy, full control, and premium access without sharing.',
    features: ['Full Solo Account', 'Private Access', 'All HBO Content', ...sharedFeatures],
    gradient: 'from-purple-900 via-violet-800 to-black',
  },

  // ─── PRIME VIDEO ─────────────────────────────────────────────────
  {
    id: 'prime-video-shared',
    name: 'Prime Video Shared Profile',
    category: 'Streaming',
    price: 40,
    duration: '30 Days',
    availability: 'In Stock',
    featured: false,
    description:
      'Shared Prime Video profile for movies, Amazon originals, and exclusive series.',
    features: ['Shared Profile', 'Movies & Series', 'HD Streaming', ...sharedFeatures],
    gradient: 'from-sky-500 via-blue-600 to-cyan-600',
  },
  {
    id: 'prime-video-solo',
    name: 'Prime Video Solo Profile',
    category: 'Streaming',
    price: 45,
    duration: '30 Days',
    availability: 'In Stock',
    featured: false,
    description:
      'Dedicated solo Prime Video profile — your own access without sharing with others.',
    features: ['Solo Profile', 'Amazon Originals', 'HD Quality', ...sharedFeatures],
    gradient: 'from-blue-500 via-indigo-500 to-blue-700',
  },

  // ─── WRITING TOOLS ───────────────────────────────────────────────
  {
    id: 'quillbot-shared',
    name: 'QuillBot Shared',
    category: 'Writing Tools',
    price: 45,
    duration: '30 Days',
    availability: 'In Stock',
    featured: false,
    description:
      'Shared QuillBot Premium for paraphrasing, grammar check, and writing assistance for students and professionals.',
    features: ['Paraphraser', 'Grammar Check', 'Premium Modes', ...sharedFeatures],
    gradient: 'from-teal-500 via-green-500 to-emerald-600',
  },
  {
    id: 'grammarly-shared',
    name: 'Grammarly Shared',
    category: 'Writing Tools',
    price: 45,
    duration: '30 Days',
    availability: 'In Stock',
    featured: false,
    description:
      'Shared Grammarly Premium for advanced grammar, tone suggestions, and plagiarism detection.',
    features: ['Advanced Grammar', 'Tone Detector', 'Plagiarism Check', ...sharedFeatures],
    gradient: 'from-emerald-500 via-green-600 to-teal-600',
  },

  // ─── AI TOOLS ────────────────────────────────────────────────────
  {
    id: 'chatgpt-plus-shared',
    name: 'Renewed ChatGPT Plus Shared',
    category: 'AI Tools',
    price: 75,
    duration: '30 Days',
    availability: 'In Stock',
    featured: true,
    badge: 'Hot',
    description:
      'Shared renewed ChatGPT Plus access — faster responses, advanced models, and premium AI features at an affordable rate.',
    features: ['ChatGPT Plus', 'Renewed Access', 'Priority AI', ...sharedFeatures],
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
  },
  {
    id: 'chatgpt-go-shared',
    name: 'ChatGPT Go Shared',
    category: 'AI Tools',
    price: 50,
    duration: '30 Days',
    availability: 'In Stock',
    featured: true,
    description:
      'Shared ChatGPT Go access — budget-friendly AI assistant for everyday tasks and conversations.',
    features: ['ChatGPT Go', 'Shared Access', 'AI Assistant', ...sharedFeatures],
    gradient: 'from-cyan-500 via-teal-400 to-green-500',
  },
]
