import { supabase } from '../lib/supabase'
import { uploadPaymentProof, validateProofFile } from './orderProof'
import { formatPrice } from '../data/products'

export interface SubmitOrderInput {
  userId: string
  productId: string
  productName: string
  amount: number
  paymentMethod: string
  notes: string
  proofFile: File
}

export interface SubmitOrderResult {
  orderId: string | null
  error: string | null
  warnings: string[]
}

export async function submitOrder(input: SubmitOrderInput): Promise<SubmitOrderResult> {
  if (!supabase) {
    return { orderId: null, error: 'Database is not configured.', warnings: [] }
  }

  const proofValidation = validateProofFile(input.proofFile)
  if (proofValidation) {
    return { orderId: null, error: proofValidation, warnings: [] }
  }

  const warnings: string[] = []

  // Ensure profile exists (fixes foreign key errors)
  const { error: profileError } = await supabase.rpc('ensure_my_profile')
  if (profileError) {
    if (profileError.message.toLowerCase().includes('does not exist')) {
      return {
        orderId: null,
        error:
          'Database function ensure_my_profile is missing. Run supabase/schema-flow-fix.sql in SQL Editor.',
        warnings: [],
      }
    }
    warnings.push(`Profile sync warning: ${profileError.message}`)
  }

  let orderId: string | null = null

  const { data: rpcOrderId, error: rpcError } = await supabase.rpc('create_order', {
    p_product_id: input.productId,
    p_product_name: input.productName,
    p_amount: input.amount,
    p_payment_method: input.paymentMethod,
    p_notes: input.notes || null,
  })

  if (!rpcError && rpcOrderId) {
    orderId = rpcOrderId as string
  } else {
    if (rpcError?.message.toLowerCase().includes('does not exist')) {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: input.userId,
          product_id: input.productId,
          product_name: input.productName,
          amount: input.amount,
          payment_method: input.paymentMethod,
          notes: input.notes || null,
          status: 'pending',
        })
        .select('id')
        .single()

      if (error || !data) {
        const hint = error?.message?.toLowerCase().includes('violates foreign key')
          ? ' Your profile row is missing. Run schema-flow-fix.sql then sign out and sign in again.'
          : ''
        return {
          orderId: null,
          error: (error?.message ?? 'Could not save order.') + hint,
          warnings,
        }
      }
      orderId = data.id
    } else {
      return {
        orderId: null,
        error: rpcError?.message ?? 'Could not create order.',
        warnings,
      }
    }
  }

  if (!orderId) {
    return { orderId: null, error: 'Could not create order.', warnings }
  }

  const { url: proofUrl, error: proofError } = await uploadPaymentProof(
    input.proofFile,
    input.userId,
    orderId
  )

  if (proofUrl) {
    const { error: updateError } = await supabase
      .from('orders')
      .update({ proof_url: proofUrl })
      .eq('id', orderId)
    if (updateError) warnings.push(`Could not attach proof URL: ${updateError.message}`)
  } else if (proofError) {
    warnings.push(`Proof upload failed: ${proofError}. You can send proof in chat.`)
  }

  const { error: msgError } = await supabase.from('order_messages').insert({
    order_id: orderId,
    sender_id: input.userId,
    sender_role: 'customer',
    body: [
      `New order: ${input.productName}`,
      `Payment: ${input.paymentMethod}`,
      `Amount: ${formatPrice(input.amount)}`,
      proofUrl ? 'Payment proof uploaded.' : 'Payment proof pending in chat.',
      input.notes ? `Notes: ${input.notes}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
  })

  if (msgError) {
    warnings.push(
      msgError.message.toLowerCase().includes('does not exist')
        ? 'Chat table missing. Run schema-messages.sql — order was still created.'
        : `Chat message failed: ${msgError.message}`
    )
  }

  return { orderId, error: null, warnings }
}
