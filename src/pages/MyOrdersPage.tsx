import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, MessageCircle, Plus, ShoppingBag } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase, type OrderRecord } from '../lib/supabase'
import { formatPrice } from '../data/products'
import { shopContact } from '../data/shopContact'
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

function defaultOrderDetailsOpen() {
  if (typeof window === 'undefined') return true
  return !window.matchMedia('(min-width: 1024px)').matches
}

export function MyOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, profile } = useAuth()
  const goToOrder = useOrderNavigation()
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [lastAdminMessageAt, setLastAdminMessageAt] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(defaultOrderDetailsOpen)

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

  useEffect(() => {
    setOrderDetailsOpen(defaultOrderDetailsOpen())
  }, [selectedId])

  const selected = orders.find((o) => o.id === selectedId)

  return (
    <div className="relative flex min-h-[calc(100dvh-5.25rem)] flex-col pt-20 lg:pt-[5.25rem]">
      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-16 sm:px-6 lg:px-8 lg:min-h-0 lg:pb-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
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
            subtitle="Track payment verification, chat with admin, and receive your product."
            align="left"
            compact
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
          <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[minmax(0,320px)_1fr] lg:items-stretch">
            <div className="space-y-2 lg:min-h-0 lg:scroll-y lg:pr-1">
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
              <div className="grid min-h-[420px] grid-rows-[auto_minmax(0,1fr)_auto] gap-2 lg:min-h-0 lg:h-full lg:min-w-0">
                {selected ? (
                  <GlassCard className="shrink-0 overflow-hidden p-0">
                    <button
                      type="button"
                      onClick={() => setOrderDetailsOpen((v) => !v)}
                      className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-white/[0.02] sm:p-4"
                      aria-expanded={orderDetailsOpen}
                      aria-controls="order-details-panel"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-base font-semibold tracking-tight text-white sm:text-lg">
                          {selected.product_name}
                        </p>
                        <p className="text-caption !text-[11px]">
                          Order #{selected.id.slice(0, 8)} · {selected.payment_method} ·{' '}
                          {formatPrice(Number(selected.amount))}
                        </p>
                        {!orderDetailsOpen && (
                          <p className="mt-1 text-[10px] text-amber-200/55 lg:inline">
                            <span className="hidden lg:inline">Click to view progress & payment proof</span>
                            <span className="lg:hidden">Tap to view progress & payment proof</span>
                          </p>
                        )}
                      </div>
                      <OrderStatusBadge status={selected.status} size="md" />
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-white/45 transition-transform duration-200 ${
                          orderDetailsOpen ? 'rotate-180' : ''
                        }`}
                        aria-hidden
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {orderDetailsOpen && (
                        <motion.div
                          id="order-details-panel"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-white/10 px-3 pb-3 pt-3 sm:px-4 sm:pb-4">
                            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-4">
                              <OrderProgress status={selected.status} compact />
                              <PaymentProofViewer
                                proofUrl={selected.proof_url}
                                className="w-full lg:max-w-[11rem]"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </GlassCard>
                ) : (
                  <GlassCard className="flex items-center justify-center p-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                  </GlassCard>
                )}

                <div className="flex min-h-[280px] flex-col overflow-hidden sm:min-h-[320px] lg:min-h-0">
                  <OrderChat
                    key={selectedId}
                    orderId={selectedId}
                    viewerRole="customer"
                    customerUsername={profile?.username}
                    title={`Chat with ${shopContact.chatSenderShort}`}
                    className="h-full min-h-0"
                  />
                </div>

                <p className="text-caption flex shrink-0 items-center gap-1.5 text-[10px] lg:text-[11px]">
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
