/**
 * Local brand images — served from /public/products/brands/
 * (Always loads on Vercel; no external hotlink blocking.)
 */

export const brandImageUrls = {
  disney: '/products/brands/disney.svg',
  iqiyi: '/products/brands/iqiyi.svg',
  iwanttfc: '/products/brands/iwanttfc.svg',
  wow: '/products/brands/wow.svg',
  viu: '/products/brands/viu.svg',
  hbo: '/products/brands/hbo.svg',
  prime: '/products/brands/prime.svg',
  quillbot: '/products/brands/quillbot.svg',
  grammarly: '/products/brands/grammarly.svg',
  chatgpt: '/products/brands/chatgpt.svg',
} as const

export function resolveProductImageUrl(productId: string): string {
  if (productId.startsWith('disney')) return brandImageUrls.disney
  if (productId.startsWith('iqiyi')) return brandImageUrls.iqiyi
  if (productId.startsWith('iwanttfc')) return brandImageUrls.iwanttfc
  if (productId.startsWith('wow')) return brandImageUrls.wow
  if (productId.startsWith('viu')) return brandImageUrls.viu
  if (productId.startsWith('hbo')) return brandImageUrls.hbo
  if (productId.startsWith('prime')) return brandImageUrls.prime
  if (productId.startsWith('quillbot')) return brandImageUrls.quillbot
  if (productId.startsWith('grammarly')) return brandImageUrls.grammarly
  if (productId.startsWith('chatgpt')) return brandImageUrls.chatgpt
  return `/products/${productId}.svg`
}

export function isLocalProductImage(src: string): boolean {
  return src.startsWith('/products/')
}
