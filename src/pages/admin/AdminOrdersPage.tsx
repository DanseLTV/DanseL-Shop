import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MessageCircle, RefreshCw } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { supabase, type OrderRecord, type OrderWithCustomer } from '../../lib/supabase'
import { formatPrice } from '../../data/products'
import { OrderChat } from '../../components/messages/OrderChat'
import { AdminOrderDetailsPanel } from '../../components/admin/AdminOrderDetailsPanel'
import { OrderStatusBadge } from '../../components/order/OrderStatusBadge'
import { orderStatusMeta } from '../../data/orderStatus'
import { getOrderStatusChatMessage } from '../../constants/orderNotifications'
import { notifyCustomerOrderStatus } from '../../utils/notifications'
import type { OrderStatus } from '../../data/orderStatus'

type StatusFilter = 'all' | 'unread' | OrderStatus

interface LastMessagePreview {
  body: string
  created_at: string
  sender_role: string
}

function customerHasUnread(order: OrderRecord, lastCustomerMsgAt?: string) {
  if (!lastCustomerMsgAt) return false
  const readAt = order.admin_last_read_at
  if (!readAt) return true
  return new Date(lastCustomerMsgAt) > new Date(readAt)
}

function previewText(body: string, max = 72) {
  const oneLine = body.replace(/\s+/g, ' ').trim()
  return oneLine.length > max ? `${oneLine.slice(0, max)}…` : oneLine
}

const validStatusFilters: StatusFilter[] = [
  'all',
  'unread',
  'pending',
  'paid',
  'delivered',
  'cancelled',
]

function parseStatusFilter(value: string | null): StatusFilter {
  if (value && validStatusFilters.includes(value as StatusFilter)) {
    return value as StatusFilter
  }
  return 'all'
}

function defaultAdminOrderDetailsOpen(status?: OrderStatus) {
  if (typeof window === 'undefined') return true
  const mobile = !window.matchMedia('(min-width: 1024px)').matches
  if (mobile) return true
  if (status === 'pending' || status === 'paid') return true
  return false
}

export function AdminOrdersPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const orderFromUrl = searchParams.get('order')
  const [orders, setOrders] = useState<OrderWithCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(() =>
    parseStatusFilter(searchParams.get('status'))
  )
  const [lastCustomerMessageAt, setLastCustomerMessageAt] = useState<Record<string, string>>({})
  const [lastMessagePreview, setLastMessagePreview] = useState<Record<string, LastMessagePreview>>(
    {}
  )
  const [messageCounts, setMessageCounts] = useState<Record<string, number>>({})
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(true)
  const initialSelectDone = useRef(false)

  const indexMessages = useCallback((msgs: { order_id: string; body: string; created_at: string; sender_role: string; deleted_at?: string | null }[]) => {
    const latest: Record<string, LastMessagePreview> = {}
    const counts: Record<string, number> = {}
    const customerLatest: Record<string, string> = {}

    for (const m of msgs) {
      if (m.deleted_at) continue
      counts[m.order_id] = (counts[m.order_id] ?? 0) + 1
      if (!latest[m.order_id]) {
        latest[m.order_id] = {
          body: m.body,
          created_at: m.created_at,
          sender_role: m.sender_role,
        }
      }
      if (m.sender_role === 'customer' && !customerLatest[m.order_id]) {
        customerLatest[m.order_id] = m.created_at
      }
    }
    setMessageCounts(counts)
    setLastMessagePreview(latest)
    setLastCustomerMessageAt(customerLatest)
  }, [])

  const loadData = useCallback(async (options?: { silent?: boolean }) => {
    if (!supabase) {
      setLoading(false)
      return
    }
    if (!options?.silent) {
      setLoading(true)
      setLoadError('')
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, profiles(username, email, phone)')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) setLoadError(error.message)

      const list = (data as OrderWithCustomer[]) ?? []
      setOrders(list)

      if (list.length > 0) {
        const ids = list.map((o) => o.id)
        const { data: msgs } = await supabase
          .from('order_messages')
          .select('order_id, body, created_at, sender_role, deleted_at')
          .in('order_id', ids)
          .order('created_at', { ascending: false })

        indexMessages(msgs ?? [])
      } else {
        setLastMessagePreview({})
        setMessageCounts({})
        setLastCustomerMessageAt({})
      }

      if (orderFromUrl && list.some((o) => o.id === orderFromUrl)) {
        setSelectedOrderId(orderFromUrl)
        initialSelectDone.current = true
      } else if (!initialSelectDone.current && list[0]) {
        setSelectedOrderId(list[0].id)
        initialSelectDone.current = true
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load orders.')
    } finally {
      if (!options?.silent) setLoading(false)
    }
  }, [orderFromUrl, indexMessages])

  useEffect(() => {
    initialSelectDone.current = false
    void loadData()
  }, [loadData])

  useEffect(() => {
    setStatusFilter(parseStatusFilter(searchParams.get('status')))
  }, [searchParams])

  useEffect(() => {
    if (!orderFromUrl || orders.length === 0) return
    if (orders.some((o) => o.id === orderFromUrl)) {
      setSelectedOrderId(orderFromUrl)
    }
  }, [orderFromUrl, orders])

  useEffect(() => {
    const client = supabase
    if (!client) return

    const channel = client
      .channel('admin-orders-live')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
        const row = payload.new as OrderWithCustomer
        setOrders((prev) =>
          prev.map((o) =>
            o.id === row.id ? { ...o, ...row, profiles: o.profiles ?? row.profiles } : o
          )
        )
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => {
        void loadData({ silent: true })
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'order_messages' }, (payload) => {
        const row = payload.new as {
          order_id: string
          body: string
          created_at: string
          sender_role: string
          deleted_at?: string | null
        }
        if (row.deleted_at) return
        setLastMessagePreview((prev) => ({
          ...prev,
          [row.order_id]: {
            body: row.body,
            created_at: row.created_at,
            sender_role: row.sender_role,
          },
        }))
        setMessageCounts((prev) => ({
          ...prev,
          [row.order_id]: (prev[row.order_id] ?? 0) + 1,
        }))
        if (row.sender_role === 'customer') {
          setLastCustomerMessageAt((prev) => ({ ...prev, [row.order_id]: row.created_at }))
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'order_messages' }, () => {
        void loadData({ silent: true })
      })
      .subscribe()

    return () => {
      void client.removeChannel(channel)
    }
  }, [loadData])

  const updateOrderStatus = async (orderId: string, status: OrderRecord['status']) => {
    if (!supabase || updatingId) return
    setActionError('')
    setActionSuccess('')
    setUpdatingId(orderId)
    const prevOrder = orders.find((o) => o.id === orderId)

    try {
      const { error: updateError } = await supabase.from('orders').update({ status }).eq('id', orderId)
      if (updateError) {
        setActionError(`Could not update status: ${updateError.message}`)
        return
      }
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)))

      if (prevOrder && user) {
        const body = getOrderStatusChatMessage(status, orderId, prevOrder.product_name)
        if (body) {
          await supabase.from('order_messages').insert({
            order_id: orderId,
            sender_id: user.id,
            sender_role: 'admin',
            body,
          })
        }

        if (status === 'paid' || status === 'delivered' || status === 'cancelled') {
          await notifyCustomerOrderStatus(
            prevOrder.user_id,
            orderId,
            status,
            prevOrder.product_name
          )
        }
      }
      setActionSuccess(
        `Order marked as "${orderStatusMeta[status].label}".`
      )
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not update the order.')
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return orders
    if (statusFilter === 'unread') {
      return orders.filter((o) => customerHasUnread(o, lastCustomerMessageAt[o.id]))
    }
    return orders.filter((o) => o.status === statusFilter)
  }, [orders, statusFilter, lastCustomerMessageAt])

  const selected = orders.find((o) => o.id === selectedOrderId)
  const unreadCount = orders.filter((o) => customerHasUnread(o, lastCustomerMessageAt[o.id])).length
  const readyToDeliverCount = orders.filter((o) => o.status === 'paid').length

  useEffect(() => {
    setOrderDetailsOpen(defaultAdminOrderDetailsOpen(selected?.status))
  }, [selectedOrderId, selected?.status])

  const filterTabs: { key: StatusFilter; label: string; count?: number }[] = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Needs reply', count: unreadCount },
    { key: 'pending', label: 'Pending' },
    { key: 'paid', label: 'Payment confirmed', count: readyToDeliverCount },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
  ]

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 px-4 py-2">
        <div className="flex flex-wrap gap-1.5">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${
                statusFilter === tab.key
                  ? 'bg-brand/30 text-white'
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              {tab.label}
              {tab.count != null && tab.count > 0 && (
                <span className="rounded-full bg-amber-500/25 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => void loadData()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1 text-xs text-white/70 hover:bg-white/5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {loadError && (
        <p className="shrink-0 border-b border-red-500/30 bg-red-500/10 px-4 py-2 text-xs text-red-300">
          {loadError}
        </p>
      )}

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      ) : orders.length === 0 ? (
        <p className="flex flex-1 items-center justify-center text-sm text-white/40">No orders yet.</p>
      ) : (
        <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
          <div className="flex min-h-0 flex-col border-b border-white/10 lg:border-b-0 lg:border-r">
            <p className="shrink-0 border-b border-white/10 px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-white/40">
              Customer inboxes ({filteredOrders.length})
            </p>
            <div className="min-h-0 flex-1 scroll-y p-2">
              {filteredOrders.length === 0 ? (
                <p className="px-2 py-6 text-center text-xs text-white/40">No orders in this filter.</p>
              ) : (
                filteredOrders.map((order) => {
                  const unread = customerHasUnread(order, lastCustomerMessageAt[order.id])
                  const active = order.id === selectedOrderId
                  const preview = lastMessagePreview[order.id]
                  const count = messageCounts[order.id] ?? 0

                  return (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => {
                        setSelectedOrderId(order.id)
                        setActionError('')
                        setActionSuccess('')
                      }}
                      className={`mb-1.5 w-full rounded-lg border p-3 text-left text-sm transition-colors ${
                        active
                          ? 'border-brand/50 bg-brand/10'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-white">{order.product_name}</p>
                          <p className="text-xs text-brand">@{order.profiles?.username ?? 'customer'}</p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          {unread && (
                            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                              New
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 text-[10px] text-white/35">
                            <MessageCircle className="h-3 w-3" />
                            {count || 'Chat'}
                          </span>
                        </div>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <OrderStatusBadge status={order.status} />
                        <span className="text-xs text-white/45">{formatPrice(Number(order.amount))}</span>
                      </div>
                      {preview ? (
                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/45">
                          <span className="font-medium text-white/55">
                            {preview.sender_role === 'customer' ? 'Customer: ' : 'You: '}
                          </span>
                          {previewText(preview.body)}
                        </p>
                      ) : (
                        <p className="mt-2 text-xs italic text-white/30">Chat ready — open to reply</p>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>

          <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)]">
            {selected ? (
              <>
                <AdminOrderDetailsPanel
                  order={selected}
                  open={orderDetailsOpen}
                  onToggle={() => setOrderDetailsOpen((v) => !v)}
                  messageCount={messageCounts[selected.id] ?? 0}
                  unread={customerHasUnread(selected, lastCustomerMessageAt[selected.id])}
                  updating={updatingId === selected.id}
                  actionError={actionError}
                  actionSuccess={actionSuccess}
                  onConfirmPayment={() => void updateOrderStatus(selected.id, 'paid')}
                  onCancelOrder={() => void updateOrderStatus(selected.id, 'cancelled')}
                  onMarkDelivered={() => void updateOrderStatus(selected.id, 'delivered')}
                />

                <div className="flex min-h-0 flex-col overflow-hidden p-3 pt-2">
                  <OrderChat
                    key={selected.id}
                    orderId={selected.id}
                    viewerRole="admin"
                    customerUsername={selected.profiles?.username}
                    title="Customer chat"
                    className="h-full min-h-0"
                    onConversationChanged={() => void loadData({ silent: true })}
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
                <MessageCircle className="h-10 w-10 text-white/20" />
                <p className="text-sm text-white/50">Select a customer order to open their chat inbox.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
