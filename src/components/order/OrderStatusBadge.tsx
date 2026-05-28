import { orderStatusMeta, type OrderStatus } from '../../data/orderStatus'

interface OrderStatusBadgeProps {
  status: OrderStatus
  size?: 'sm' | 'md'
}

export function OrderStatusBadge({ status, size = 'sm' }: OrderStatusBadgeProps) {
  const meta = orderStatusMeta[status]
  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${meta.color} ${
        size === 'md' ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-[10px]'
      }`}
    >
      {meta.label}
    </span>
  )
}
