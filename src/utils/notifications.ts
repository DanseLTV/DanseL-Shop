import { supabase } from '../lib/supabase'
import type { OrderRecord } from '../lib/supabase'
import {
  adminOrderLink,
  customerOrderLink,
  getOrderStatusNotificationMeta,
} from '../constants/orderNotifications'

function previewText(text: string, max = 120) {
  const oneLine = text.replace(/\s+/g, ' ').trim()
  return oneLine.length > max ? `${oneLine.slice(0, max)}…` : oneLine
}

async function createNotification(input: {
  userId: string
  type: 'order_status' | 'new_order' | 'new_message'
  title: string
  body: string
  orderId: string
  linkPath: string
}) {
  if (!supabase) return

  const { error } = await supabase.rpc('create_notification', {
    p_user_id: input.userId,
    p_type: input.type,
    p_title: input.title,
    p_body: input.body,
    p_order_id: input.orderId,
    p_link_path: input.linkPath,
  })

  if (error) {
    console.warn('create_notification failed:', error.message)
  }
}

async function notifyAllAdmins(input: {
  type: 'order_status' | 'new_order' | 'new_message'
  title: string
  body: string
  orderId: string
  linkPath: string
}) {
  if (!supabase) return

  const { error } = await supabase.rpc('notify_all_admins', {
    p_type: input.type,
    p_title: input.title,
    p_body: input.body,
    p_order_id: input.orderId,
    p_link_path: input.linkPath,
  })

  if (error) {
    console.warn('notify_all_admins failed:', error.message)
  }
}

export async function notifyCustomerOrderStatus(
  customerId: string,
  orderId: string,
  status: 'paid' | 'delivered' | 'cancelled',
  productName: string
) {
  const meta = getOrderStatusNotificationMeta(status, orderId, productName)
  await createNotification({
    userId: customerId,
    type: 'order_status',
    title: meta.title,
    body: meta.body,
    orderId,
    linkPath: customerOrderLink(orderId),
  })
}

export async function notifyAdminsNewOrder(input: {
  orderId: string
  productName: string
  customerUsername?: string
  amount: number
}) {
  const who = input.customerUsername ? `@${input.customerUsername}` : 'A customer'
  await notifyAllAdmins({
    type: 'new_order',
    title: 'New order',
    body: `${who} ordered ${input.productName}. Open chat to verify payment.`,
    orderId: input.orderId,
    linkPath: adminOrderLink(input.orderId),
  })
}

export async function notifyRecipientNewMessage(input: {
  orderId: string
  recipientUserId: string
  senderLabel: string
  messageBody: string
  linkPath: string
}) {
  await createNotification({
    userId: input.recipientUserId,
    type: 'new_message',
    title: `New message from ${input.senderLabel}`,
    body: previewText(input.messageBody),
    orderId: input.orderId,
    linkPath: input.linkPath,
  })
}

export async function notifyAdminsCustomerMessage(input: {
  orderId: string
  customerUsername?: string
  messageBody: string
}) {
  const who = input.customerUsername ? `@${input.customerUsername}` : 'Customer'
  await notifyAllAdmins({
    type: 'new_message',
    title: `Message from ${who}`,
    body: previewText(input.messageBody),
    orderId: input.orderId,
    linkPath: adminOrderLink(input.orderId),
  })
}

export type { OrderRecord }
