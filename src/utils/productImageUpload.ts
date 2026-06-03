import { supabase } from '../lib/supabase'
import { withTimeout } from './asyncHelpers'

/** Customer product card image area is wide and short — keep crops consistent. */
export const PRODUCT_CARD_ASPECT = 16 / 10

const MAX_BYTES = 8 * 1024 * 1024
const OUTPUT_WIDTH = 800
const OUTPUT_HEIGHT = Math.round(OUTPUT_WIDTH / PRODUCT_CARD_ASPECT)

export interface PixelCrop {
  x: number
  y: number
  width: number
  height: number
}

export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Please choose an image file (PNG, JPG, WEBP).'
  }
  if (file.size > MAX_BYTES) {
    return 'Image must be 8MB or smaller.'
  }
  return null
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Could not read the image file.'))
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not load the image for cropping.'))
    img.src = src
  })
}

/** Crops the source image to the selected pixels and returns a JPEG blob sized for cards. */
export async function getCroppedBlob(
  imageSrc: string,
  crop: PixelCrop
): Promise<Blob> {
  const image = await loadImage(imageSrc)
  const canvas = document.createElement('canvas')
  canvas.width = OUTPUT_WIDTH
  canvas.height = OUTPUT_HEIGHT

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not supported in this browser.')

  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    OUTPUT_WIDTH,
    OUTPUT_HEIGHT
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Could not generate the cropped image.'))
      },
      'image/jpeg',
      0.9
    )
  })
}

/** Uploads a cropped product image and returns its public URL. */
export async function uploadProductImage(
  blob: Blob,
  productId: string
): Promise<{ url: string | null; error: string | null }> {
  if (!supabase) return { url: null, error: 'Storage is not configured.' }

  const path = `${productId}-${Date.now()}.jpg`

  const { error: uploadError } = await withTimeout(
    supabase.storage
      .from('product-images')
      .upload(path, blob, { upsert: true, contentType: 'image/jpeg', cacheControl: '3600' }),
    20000,
    'Product image upload timed out.'
  )

  if (uploadError) {
    return { url: null, error: uploadError.message }
  }

  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  return { url: data.publicUrl, error: null }
}
