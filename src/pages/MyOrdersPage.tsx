import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Package, MessageCircle, Plus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase, type OrderRecord } from '../lib/supabase'
import { formatPrice } from '../data/products'
import { AnimatedBackground } from '../components/ui/AnimatedBackground'
import { ScrollReveal } from '../components/ui/ScrollReveal'
import { SectionHeading } from '../components/ui/SectionHeading'
import { GlassCard } from '../components/ui/GlassCard'
import { OrderChat } from '../components/messages/OrderChat'
import { GradientButton } from '../components/ui/GradientButton'
import { BackNavLink } from '../components/ui/BackNavLink'
import { OrderStatusBadge } from '../components/order/OrderStatusBadge'
import { OrderProgress } from '../components/order/OrderProgress'
import { PaymentProofViewer } from '../components/order/PaymentProofViewer'
import { useOrderNavigation } from '../hooks/useOrderNavigation'

function hasUnreadForCustomer(order: OrderRecord, lastMessageAt?: string) {
  if (!lastMessageAt) return false
  const readAt = order.customer_last_read_at
  if (!readAt) return true
  return new Date(lastMessageAt) > new Date(readAt)
}

export function MyOrdersPage() {
  const { orderId: paramOrderId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const goToOrder = useOrderNavigation()
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [lastAdminMessageAt, setLastAdminMessageAt] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const selectedId = paramOrderId ?? orders[0]?.id ?? null

  const initialNavDone = useRef(false)

  const loadOrders = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!supabase || !user) {
        setLoading(false)
        return
      }
      if (!options?.silent) {
        setLoading(true)
        setLoadError('')
      }

      try {
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (ordersError) {
          setLoadError(ordersError.message)
          setOrders([])
          return
        }

        const list = (ordersData as OrderRecord[]) ?? []
        setOrders(list)

        if (list.length > 0) {
          const ids = list.map((o) => o.id)
          const { data: msgs } = await supabase
            .from('order_messages')
            .select('order_id, created_at, sender_role')
            .in('order_id', ids)
            .eq('sender_role', 'admin')
            .order('created_at', { ascending: false })

          const map: Record<string, string> = {}
          for (const m of msgs ?? []) {
            if (!map[m.order_id]) map[m.order_id] = m.created_at
          }
          setLastAdminMessageAt(map)
        }
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Failed to load orders.')
      } finally {
        if (!options?.silent) setLoading(false)
      }
    },
    [user]
  )

  useEffect(() => {
    initialNavDone.current = false
    void loadOrders()
  }, [loadOrders])

  // Live updates without hiding the chat (no full-page loading spinner).
  useEffect(() => {
    const client = supabase
    if (!client || !user) return

    const channel = client
      .channel(`my-orders-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const row = payload.new as OrderRecord
          setOrders((prev) =>
            prev.map((o) => (o.id === row.id ? { ...o, ...row } : o))
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          void loadOrders({ silent: true })
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'order_messages' },
        (payload) => {
          const row = payload.new as { order_id: string; created_at: string; sender_role: string }
          if (row.sender_role !== 'admin') return
          setLastAdminMessageAt((prev) => ({ ...prev, [row.order_id]: row.created_at }))
        }
      )
      .subscribe()

    return () => {
      void client.removeChannel(channel)
    }
  }, [user, loadOrders])

  useEffect(() => {
    if (paramOrderId || !orders[0] || initialNavDone.current) return
    initialNavDone.current = true
    navigate(`/orders/${orders[0].id}`, { replace: true })
  }, [orders, paramOrderId, navigate])

  const selectOrder = (id: string) => {
    navigate(`/orders/${id}`, { replace: true })
  }

  const selected = orders.find((o) => o.id === selectedId)

  return (
    <div className="relative min-h-screen pt-24">
      <AnimatedBackground />
      <div className="relative mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <BackNavLink to="/account" label="Back to account" />
          <GradientButton onClick={() => goToOrder()} size="sm">
            <Plus className="h-4 w-4" />
            New order
          </GradientButton>
        </div>

        <ScrollReveal>
          <SectionHeading
            badge="Orders"
            title="My Orders & Messages"
            subtitle="Track payment verification, chat with admin, and receive your product — all in one place."
            align="left"
          />
        </ScrollReveal>

        {loadError && (
          <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            Could not load orders: {loadError}
          </p>
        )}

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent-violet border-t-transparent" />
          </div>
        ) : orders.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <Package className="mx-auto h-10 w-10 text-white/30" />
            <p className="mt-4 text-white/60">You have no orders yet.</p>
            <p className="mt-2 text-sm text-white/40">
              Browse the shop, pick a product, and checkout when you&apos;re ready.
            </p>
            <GradientButton onClick={() => goToOrder()} className="mt-6">
              Place your first order
            </GradientButton>
          </GlassCard>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
            <div className="space-y-2 lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto lg:pr-1">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/40">
                Your orders ({orders.length})
              </p>
              {orders.map((order) => {
                const unread = hasUnreadForCustomer(order, lastAdminMessageAt[order.id])
                const active = order.id === selectedId
                return (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => selectOrder(order.id)}
                    className={`w-full rounded-xl border p-4 text-left transition-all ${
                      active
                        ? 'border-accent-violet/50 bg-accent-violet/10'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-white line-clamp-1">{order.product_name}</p>
                      {unread && (
                        <span className="shrink-0 rounded-full bg-accent-cyan/20 px-2 py-0.5 text-[10px] font-bold text-accent-cyan">
                          New
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <OrderStatusBadge status={order.status} />
                      <span className="text-xs text-white/50">
                        {formatPrice(Number(order.amount))}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-white/40">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </button>
                )
              })}
            </div>

            {selected && (
              <div className="space-y-4">
                <GlassCard className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-lg font-semibold text-white">
                        {selected.product_name}
                      </p>
                      <p className="text-sm text-white/50">
                        Order #{selected.id.slice(0, 8)} · {selected.payment_method} ·{' '}
                        {formatPrice(Number(selected.amount))}
                      </p>
                    </div>
                    <OrderStatusBadge status={selected.status} size="md" />
                  </div>
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <OrderProgress status={selected.status} />
                  </div>
                </GlassCard>

                <GlassCard className="p-4">
                  <PaymentProofViewer proofUrl={selected.proof_url} />
                </GlassCard>

                <OrderChat
                  key={selected.id}
                  orderId={selected.id}
                  viewerRole="customer"
                  title="Chat with Admin"
                  className="min-h-[360px]"
                />

                <p className="flex items-center gap-2 text-xs text-white/40">
                  <MessageCircle className="h-3.5 w-3.5" />
                  Admin usually replies within 15–60 minutes. Send account questions here.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
