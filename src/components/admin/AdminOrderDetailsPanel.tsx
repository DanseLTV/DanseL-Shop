import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Copy, Check, MessageCircle } from 'lucide-react'
import type { OrderWithCustomer } from '../../lib/supabase'
import { formatPrice } from '../../data/products'
import { orderStatusMeta } from '../../data/orderStatus'
import { OrderStatusBadge } from '../order/OrderStatusBadge'
import { OrderProgress } from '../order/OrderProgress'
import { PaymentProofViewer } from '../order/PaymentProofViewer'

interface AdminOrderDetailsPanelProps {
  order: OrderWithCustomer
  open: boolean
  onToggle: () => void
  messageCount: number
  unread: boolean
  updating: boolean
  actionError: string
  actionSuccess: string
  onConfirmPayment: () => void
  onCancelOrder: () => void
  onMarkDelivered: () => void
}

function shortOrderId(id: string) {
  return id.replace(/-/g, '').slice(0, 5).toUpperCase()
}

function formatOrderDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function DetailCell({
  label,
  children,
  className = '',
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`min-h-[3.25rem] bg-[#070812] px-3 py-2 ${className}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">{label}</p>
      <div className="mt-1 text-sm leading-snug text-white/85">{children}</div>
    </div>
  )
}

function adminProgressHint(status: OrderWithCustomer['status']) {
  switch (status) {
    case 'pending':
      return 'Review the payment proof, then confirm payment when verified.'
    case 'paid':
      return 'Send the product or account details in chat, then mark as delivered.'
    case 'delivered':
      return 'Order is complete. Customer sees this as delivered.'
    case 'cancelled':
      return 'Order was cancelled. Reply in chat only if the customer has questions.'
    default:
      return ''
  }
}

export function AdminOrderDetailsPanel({
  order,
  open,
  onToggle,
  messageCount,
  unread,
  updating,
  actionError,
  actionSuccess,
  onConfirmPayment,
  onCancelOrder,
  onMarkDelivered,
}: AdminOrderDetailsPanelProps) {
  const [copied, setCopied] = useState(false)
  const qty = order.quantity && order.quantity > 1 ? order.quantity : 1
  const username = order.profiles?.username ?? 'customer'
  const orderCode = shortOrderId(order.id)

  const copyOrderId = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(order.id)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="shrink-0 border-b border-white/10 bg-white/[0.02]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-white/[0.03]"
        aria-expanded={open}
        aria-controls="admin-order-details-panel"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-white">{order.product_name}</p>
            {qty > 1 && (
              <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-white/70">
                ×{qty}
              </span>
            )}
            {unread && (
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                Needs reply
              </span>
            )}
          </div>
          <p className="text-xs text-white/50">
            @{username} · #{orderCode} · {order.payment_method} · {formatPrice(Number(order.amount))}
          </p>
          {!open && (
            <p className="mt-1 text-[10px] text-white/40">
              Expand for order details, payment proof, and actions
            </p>
          )}
        </div>
        <OrderStatusBadge status={order.status} size="md" />
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-white/45 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="admin-order-details-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-3 border-t border-white/10 px-3 pb-3 pt-3">
              <div className="overflow-hidden rounded-xl border border-white/10">
                <div className="grid grid-cols-2 gap-px bg-white/10 sm:grid-cols-4">
                  <DetailCell label="Order ID">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="font-mono font-semibold tracking-wide">#{orderCode}</span>
                      <button
                        type="button"
                        onClick={(e) => void copyOrderId(e)}
                        className="inline-flex items-center gap-0.5 rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-white/55 hover:bg-white/5 hover:text-white"
                        title="Copy full order ID"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            OK
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            Copy
                          </>
                        )}
                      </button>
                    </span>
                  </DetailCell>
                  <DetailCell label="Placed">{formatOrderDate(order.created_at)}</DetailCell>
                  <DetailCell label="Payment">{order.payment_method}</DetailCell>
                  <DetailCell label="Qty">{qty}</DetailCell>
                  <DetailCell label="Total">{formatPrice(Number(order.amount))}</DetailCell>
                  <DetailCell label="Messages">
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle className="h-3.5 w-3.5 text-white/40" />
                      {messageCount || 'None'}
                    </span>
                  </DetailCell>
                  <DetailCell label="Customer" className="col-span-2">
                    @{username}
                  </DetailCell>
                </div>
                <div className="grid grid-cols-1 gap-px border-t border-white/10 bg-white/10 sm:grid-cols-2">
                  <div className="min-h-[3.25rem] bg-[#070812] px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                      Email
                    </p>
                    <p className="mt-1 break-all text-sm leading-snug text-white/85">
                      {order.profiles?.email ?? '—'}
                    </p>
                  </div>
                  <div className="min-h-[3.25rem] bg-[#070812] px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                      Phone
                    </p>
                    <p className="mt-1 break-all text-sm leading-snug text-white/85">
                      {order.profiles?.phone ?? '—'}
                    </p>
                  </div>
                </div>
              </div>

              {order.notes?.trim() && (
                <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                    Notes
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-white/75">{order.notes}</p>
                </div>
              )}

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
                  <div className="mb-2.5 flex items-center justify-between gap-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                      Progress
                    </p>
                    <OrderStatusBadge status={order.status} size="sm" />
                  </div>
                  <OrderProgress status={order.status} dense showDescription={false} />
                  <p className="mt-2.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-2 text-[11px] leading-relaxed text-white/60">
                    <span className="font-semibold text-white/75">
                      {orderStatusMeta[order.status].label} —{' '}
                    </span>
                    {adminProgressHint(order.status)}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                    Payment proof
                  </p>
                  <PaymentProofViewer proofUrl={order.proof_url} compact />
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                  Actions
                </p>

                {order.status === 'pending' && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={updating}
                      onClick={onConfirmPayment}
                      className="btn-neon-success px-3 py-1.5 text-xs disabled:opacity-50"
                    >
                      {updating ? 'Updating…' : 'Payment confirmed'}
                    </button>
                    <button
                      type="button"
                      disabled={updating}
                      onClick={onCancelOrder}
                      className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                    >
                      Cancel order
                    </button>
                  </div>
                )}

                {order.status === 'paid' && (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs leading-relaxed text-sky-100/80">
                      Product sent sa chat? Mark as{' '}
                      <strong className="text-white">Delivered</strong>.
                    </p>
                    <button
                      type="button"
                      disabled={updating}
                      onClick={onMarkDelivered}
                      className="btn-glow shrink-0 px-4 py-2 text-xs disabled:opacity-50"
                    >
                      {updating ? 'Updating…' : 'Mark delivered'}
                    </button>
                  </div>
                )}

                {order.status === 'delivered' && (
                  <p className="text-xs text-emerald-200/90">
                    Complete — send account details sa chat kung kailangan.
                  </p>
                )}

                {order.status === 'cancelled' && (
                  <p className="text-xs text-red-200/90">
                    Cancelled — customer can still message in chat.
                  </p>
                )}
              </div>

              {actionError && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-300">
                  {actionError}
                </p>
              )}
              {actionSuccess && (
                <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300">
                  {actionSuccess}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
