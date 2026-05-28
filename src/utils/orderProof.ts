import { supabase } from '../lib/supabase'
import { withTimeout } from './asyncHelpers'

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']

export function validateProofFile(file: File): string | null {
  if (file.size > MAX_BYTES) return 'File must be 5MB or smaller.'
  if (!ALLOWED_TYPES.includes(file.type) && !file.type.startsWith('image/')) {
    return 'Please upload a PNG, JPG, WEBP, or PDF file.'
  }
  return null
}

export async function uploadPaymentProof(
  file: File,
  userId: string,
  orderId: string
): Promise<{ url: string | null; error: string | null }> {
  if (!supabase) return { url: null, error: 'Storage is not configured.' }

  const validation = validateProofFile(file)
  if (validation) return { url: null, error: validation }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const safeExt = ext.replace(/[^a-z0-9]/g, '') || 'jpg'
  const path = `${userId}/${orderId}.${safeExt}`

  const { error: uploadError } = await withTimeout(
    supabase.storage
      .from('payment-proofs')
      .upload(path, file, { upsert: true, contentType: file.type || undefined }),
    15000,
    'Payment proof storage upload timed out.'
  )

  if (uploadError) {
    return { url: null, error: uploadError.message }
  }

  const { data } = supabase.storage.from('payment-proofs').getPublicUrl(path)
  return { url: data.publicUrl, error: null }
}
