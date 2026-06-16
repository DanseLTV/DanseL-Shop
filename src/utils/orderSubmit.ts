import { supabase } from '../lib/supabase'
import { uploadPaymentProof, validateProofFile } from './orderProof'
import { formatPrice } from '../data/products'
import { notifyAdminsNewOrder } from './notifications'

export interface SubmitOrderInput {
  userId: string
  productId: string
  productName: string
  amount: number
  quantity?: number
  paymentMethod: string
  notes: string
  proofFile: File
  customerUsername?: string
}

export interface CartOrderLine {
  productId: string
  productName: string
  unitPrice: number
  quantity: number
}

export interface SubmitCartOrderInput {
  userId: string
  lines: CartOrderLine[]
  paymentMethod: string
  notes: string
  proofFile: File
  customerUsername?: string
}

export interface SubmitOrderResult {
  orderId: string | null
  orderIds?: string[]
  error: string | null
  warnings: string[]
}

async function createOrderRow(input: {
  userId: string
  productId: string
  productName: string
  amount: number
  quantity: number
  paymentMethod: string
  notes: string | null
}): Promise<{ orderId: string | null; error: string | null }> {
  if (!supabase) return { orderId: null, error: 'Database is not configured.' }

  const { data: rpcOrderId, error: rpcError } = await supabase.rpc('create_order', {
    p_product_id: input.productId,
    p_product_name: input.productName,
    p_amount: input.amount,
    p_payment_method: input.paymentMethod,
    p_notes: input.notes,
    p_quantity: input.quantity,
  })

  if (!rpcError && rpcOrderId) {
    return { orderId: rpcOrderId as string, error: null }
  }

  if (rpcError?.message.toLowerCase().includes('does not exist')) {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: input.userId,
        product_id: input.productId,
        product_name: input.productName,
        amount: input.amount,
        payment_method: input.paymentMethod,
        notes: input.notes,
        status: 'pending',
        quantity: input.quantity,
      })
      .select('id')
      .single()

    if (error || !data) {
      const hint = error?.message?.toLowerCase().includes('violates foreign key')
        ? ' Your profile row is missing. Run schema-flow-fix.sql then sign out and sign in again.'
        : ''
      return { orderId: null, error: (error?.message ?? 'Could not save order.') + hint }
    }
    return { orderId: data.id, error: null }
  }

  return { orderId: null, error: rpcError?.message ?? 'Could not create order.' }
}

async function attachProofAndChat(input: {
  orderId: string
  userId: string
  proofFile: File
  reuseProofUrl?: string | null
  chatBody: string
  warnings: string[]
}) {
  if (!supabase) return null

  let proofUrl = input.reuseProofUrl ?? null

  if (!proofUrl) {
    const { url, error: proofError } = await uploadPaymentProof(
      input.proofFile,
      input.userId,
      input.orderId
    )
    proofUrl = url
    if (proofUrl) {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ proof_url: proofUrl })
        .eq('id', input.orderId)
      if (updateError) {
        input.warnings.push(`Could not attach proof URL: ${updateError.message}`)
      }
    } else if (proofError) {
      input.warnings.push(`Proof upload failed: ${proofError}. You can send proof in chat.`)
    }
  } else {
    const { error: updateError } = await supabase
      .from('orders')
      .update({ proof_url: proofUrl })
      .eq('id', input.orderId)
    if (updateError) {
      input.warnings.push(`Could not attach shared proof URL: ${updateError.message}`)
    }
  }

  const { error: msgError } = await supabase.from('order_messages').insert({
    order_id: input.orderId,
    sender_id: input.userId,
    sender_role: 'customer',
    body: input.chatBody,
  })

  if (msgError) {
    const { error: threadError } = await supabase.rpc('ensure_order_chat_thread', {
      p_order_id: input.orderId,
    })
    if (threadError) {
      input.warnings.push(
        msgError.message.toLowerCase().includes('does not exist')
          ? 'Chat table missing. Run schema-messages.sql — order was still created.'
          : `Chat message failed: ${msgError.message}`
      )
    }
  }

  return proofUrl
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

  const quantity = input.quantity ?? 1
  const created = await createOrderRow({
    userId: input.userId,
    productId: input.productId,
    productName: input.productName,
    amount: input.amount,
    quantity,
    paymentMethod: input.paymentMethod,
    notes: input.notes || null,
  })

  if (created.error || !created.orderId) {
    return { orderId: null, error: created.error ?? 'Could not create order.', warnings }
  }
  orderId = created.orderId

  await attachProofAndChat({
    orderId,
    userId: input.userId,
    proofFile: input.proofFile,
    chatBody: [
      quantity > 1
        ? `New order: ${input.productName} ×${quantity}`
        : `New order: ${input.productName}`,
      `Payment: ${input.paymentMethod}`,
      `Amount: ${formatPrice(input.amount)}`,
      'Payment proof uploaded.',
      input.notes ? `Notes: ${input.notes}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    warnings,
  })

  await notifyAdminsNewOrder({
    orderId,
    productName: input.productName,
    customerUsername: input.customerUsername,
    amount: input.amount,
  })

  return { orderId, error: null, warnings }
}

export async function submitCartOrder(input: SubmitCartOrderInput): Promise<SubmitOrderResult> {
  if (!supabase) {
    return { orderId: null, error: 'Database is not configured.', warnings: [] }
  }

  if (input.lines.length === 0) {
    return { orderId: null, error: 'Your cart is empty.', warnings: [] }
  }

  const proofValidation = validateProofFile(input.proofFile)
  if (proofValidation) {
    return { orderId: null, error: proofValidation, warnings: [] }
  }

  const warnings: string[] = []

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

  const orderIds: string[] = []
  let sharedProofUrl: string | null = null
  const grandTotal = input.lines.reduce(
    (sum, line) => sum + line.unitPrice * line.quantity,
    0
  )

  for (let i = 0; i < input.lines.length; i++) {
    const line = input.lines[i]
    const lineAmount = line.unitPrice * line.quantity

    const created = await createOrderRow({
      userId: input.userId,
      productId: line.productId,
      productName: line.productName,
      amount: lineAmount,
      quantity: line.quantity,
      paymentMethod: input.paymentMethod,
      notes: input.notes || null,
    })

    if (created.error || !created.orderId) {
      if (orderIds.length > 0) {
        warnings.push(
          `Some orders were created before an error: ${created.error ?? 'unknown error'}. Check My Orders.`
        )
        return { orderId: orderIds[0], orderIds, error: created.error, warnings }
      }
      return { orderId: null, error: created.error ?? 'Could not create order.', warnings }
    }

    orderIds.push(created.orderId)

    const lineLabel =
      line.quantity > 1 ? `${line.productName} ×${line.quantity}` : line.productName

    const chatBody =
      i === 0
        ? [
            `New cart checkout (${input.lines.length} item${input.lines.length !== 1 ? 's' : ''}):`,
            ...input.lines.map((l) => {
              const label = l.quantity > 1 ? `${l.productName} ×${l.quantity}` : l.productName
              return `• ${label} — ${formatPrice(l.unitPrice * l.quantity)}`
            }),
            `Payment: ${input.paymentMethod}`,
            `Grand total: ${formatPrice(grandTotal)}`,
            'Payment proof uploaded (covers all items in this checkout).',
            input.notes ? `Notes: ${input.notes}` : '',
          ]
            .filter(Boolean)
            .join('\n')
        : [
            `Part of cart checkout — ${lineLabel}`,
            `Line total: ${formatPrice(lineAmount)}`,
            `Payment: ${input.paymentMethod}`,
            sharedProofUrl ? 'Same payment proof as other items in this checkout.' : '',
          ]
            .filter(Boolean)
            .join('\n')

    const proofUrl = await attachProofAndChat({
      orderId: created.orderId,
      userId: input.userId,
      proofFile: input.proofFile,
      reuseProofUrl: i === 0 ? null : sharedProofUrl,
      chatBody,
      warnings,
    })

    if (i === 0 && proofUrl) {
      sharedProofUrl = proofUrl
    }

    await notifyAdminsNewOrder({
      orderId: created.orderId,
      productName: line.productName,
      customerUsername: input.customerUsername,
      amount: lineAmount,
    })
  }

  return { orderId: orderIds[0] ?? null, orderIds, error: null, warnings }
}
