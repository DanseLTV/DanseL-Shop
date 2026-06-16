import type { OrderRecord } from '../lib/supabase'

export const ORDER_DELIVERED_MESSAGE =
  'Your order has been delivered! Check this chat for your account details. Enjoy!'

export function getOrderStatusChatMessage(
  status: OrderRecord['status'],
  orderId: string,
  productName: string
): string | null {
  switch (status) {
    case 'paid':
      return `Payment confirmed for order #${orderId.slice(0, 8)}. We're preparing your ${productName}.`
    case 'delivered':
      return ORDER_DELIVERED_MESSAGE
    case 'cancelled':
      return 'This order was cancelled. Reply here if you need help.'
    default:
      return null
  }
}

export function getOrderStatusNotificationMeta(
  status: 'paid' | 'delivered' | 'cancelled',
  orderId: string,
  productName: string
): { title: string; body: string } {
  switch (status) {
    case 'paid':
      return {
        title: 'Payment confirmed',
        body: getOrderStatusChatMessage('paid', orderId, productName)!,
      }
    case 'delivered':
      return {
        title: 'Order delivered',
        body: ORDER_DELIVERED_MESSAGE,
      }
    case 'cancelled':
      return {
        title: 'Order cancelled',
        body: getOrderStatusChatMessage('cancelled', orderId, productName)!,
      }
  }
}

export function customerOrderLink(orderId: string) {
  return `/orders?order=${encodeURIComponent(orderId)}`
}

export function adminOrderLink(orderId: string) {
  return `/admin/orders?order=${encodeURIComponent(orderId)}`
}
