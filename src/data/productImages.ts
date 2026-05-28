/**
 * Brand images (Wikimedia Commons — stable CDN).
 * Used for all product variants sharing the same brand.
 */

const WIKI = 'https://upload.wikimedia.org/wikipedia'

export const brandImageUrls = {
  disney: `${WIKI}/commons/thumb/3/3e/Disney%2B_logo.svg/512px-Disney%2B_logo.svg.png`,
  iqiyi: `${WIKI}/commons/thumb/4/4f/IQIYI_logo.svg/512px-IQIYI_logo.svg.png`,
  iwanttfc: `${WIKI}/commons/thumb/f/f1/IWantTFC_logo.svg/512px-IWantTFC_logo.svg.png`,
  wow: `${WIKI}/en/4/4a/WOW_Presents_Plus.png`,
  viu: `${WIKI}/commons/thumb/8/8d/Viu_logo.svg/512px-Viu_logo.svg.png`,
  hbo: `${WIKI}/commons/thumb/1/17/HBO_Max_Logo.svg/512px-HBO_Max_Logo.svg.png`,
  prime: `${WIKI}/commons/thumb/1/11/Amazon_Prime_Video_logo.svg/512px-Amazon_Prime_Video_logo.svg.png`,
  quillbot: `${WIKI}/commons/thumb/8/8a/Quillbot_logo.svg/512px-Quillbot_logo.svg.png`,
  grammarly: `${WIKI}/commons/thumb/3/31/Grammarly_logo.svg/512px-Grammarly_logo.svg.png`,
  chatgpt: `${WIKI}/commons/thumb/0/04/ChatGPT_logo.svg/512px-ChatGPT_logo.svg.png`,
} as const

/** Map every product id → brand image URL */
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
