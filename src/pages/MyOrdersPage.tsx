import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MessageCircle, Plus, ShoppingBag } from 'lucide-react'
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
import { EmptyState } from '../components/ui/EmptyState'
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
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, profile } = useAuth()
  const goToOrder = useOrderNavigation()
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [lastAdminMessageAt, setLastAdminMessageAt] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const orderFromUrl = searchParams.get('order')
  const selectedId =
    orderFromUrl && orders.some((o) => o.id === orderFromUrl)
      ? orderFromUrl
      : orders[0]?.id ?? null

  const initialSelectDone = useRef(false)

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
    initialSelectDone.current = false
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
    if (!orders[0] || initialSelectDone.current) return
    initialSelectDone.current = true
    if (!orderFromUrl) {
      setSearchParams({ order: orders[0].id }, { replace: true })
    }
  }, [orders, orderFromUrl, setSearchParams])

  const selectOrder = (id: string) => {
    setSearchParams({ order: id }, { replace: true })
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
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="h-7 w-7" />}
            title="No orders yet"
            description="Browse the shop, pick a product, and checkout when you're ready. Messages with admin appear here after you order."
            actionLabel="Browse the shop"
            actionTo="/shop"
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
            <div className="space-y-2 lg:max-h-[calc(100vh-12rem)] lg:scroll-y lg:pr-1">
              <p className="text-eyebrow mb-2 !text-[10px]">
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
                        ? 'border-brand/50 bg-brand/10'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-white line-clamp-1">
                        {order.product_name}
                        {order.quantity && order.quantity > 1 ? ` ×${order.quantity}` : ''}
                      </p>
                      {unread && (
                        <span className="shrink-0 rounded-full bg-brand-bright/20 px-2 py-0.5 text-[10px] font-bold text-brand-bright">
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

            {selectedId && (
              <div className="flex min-h-0 min-w-0 flex-col gap-4 lg:max-h-[calc(100vh-8rem)]">
                {selected ? (
                  <GlassCard className="shrink-0 p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-lg font-semibold tracking-tight text-white">
                          {selected.product_name}
                        </p>
                        <p className="text-caption">
                          Order #{selected.id.slice(0, 8)} · {selected.payment_method} ·{' '}
                          {formatPrice(Number(selected.amount))}
                        </p>
                      </div>
                      <OrderStatusBadge status={selected.status} size="md" />
                    </div>
                    <div className="mt-4 border-t border-white/10 pt-4">
                      <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-[1fr_auto] sm:gap-4">
                        <OrderProgress status={selected.status} />
                        <PaymentProofViewer
                          proofUrl={selected.proof_url}
                          className="w-full max-w-full sm:max-w-[13rem] sm:justify-self-end"
                        />
                      </div>
                    </div>
                  </GlassCard>
                ) : (
                  <GlassCard className="flex items-center justify-center p-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                  </GlassCard>
                )}

                <div className="flex min-h-[320px] flex-1 flex-col overflow-hidden">
                  <OrderChat
                    key={selectedId}
                    orderId={selectedId}
                    viewerRole="customer"
                    customerUsername={profile?.username}
                    title="Chat with Admin"
                    className="h-full max-h-[min(28rem,calc(100dvh-14rem))] lg:max-h-none"
                  />
                </div>

                <p className="text-caption flex shrink-0 items-center gap-2">
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
