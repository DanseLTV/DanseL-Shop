import type { OrderRecord } from '../lib/supabase'

export type OrderStatus = OrderRecord['status']

export const orderStatusMeta: Record<
  OrderStatus,
  { label: string; description: string; color: string }
> = {
  pending: {
    label: 'Pending payment',
    description: 'We received your order. Admin is verifying your payment proof.',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
  paid: {
    label: 'Payment confirmed',
    description: 'Payment verified. Your product is being prepared for delivery.',
    color: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  },
  delivered: {
    label: 'Delivered',
    description: 'Your order is complete. Check chat for account details if needed.',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  cancelled: {
    label: 'Cancelled',
    description: 'This order was cancelled. Message admin if you have questions.',
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
}

export const orderPipelineSteps: { status: OrderStatus; title: string }[] = [
  { status: 'pending', title: 'Order placed' },
  { status: 'paid', title: 'Payment verified' },
  { status: 'delivered', title: 'Delivered' },
]

export function statusIndex(status: OrderStatus): number {
  if (status === 'cancelled') return -1
  const idx = orderPipelineSteps.findIndex((s) => s.status === status)
  return idx >= 0 ? idx : 0
}
