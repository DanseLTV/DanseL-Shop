import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Users, Clock, LogOut, RefreshCw, MessageCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase, type OrderRecord, type OrderWithCustomer } from '../lib/supabase'
import { formatPrice } from '../data/products'
import { AnimatedBackground } from '../components/ui/AnimatedBackground'
import { ScrollReveal } from '../components/ui/ScrollReveal'
import { SectionHeading } from '../components/ui/SectionHeading'
import { GradientButton } from '../components/ui/GradientButton'
import { GlassCard } from '../components/ui/GlassCard'
import { OrderChat } from '../components/messages/OrderChat'
import { OrderStatusBadge } from '../components/order/OrderStatusBadge'
import { OrderProgress } from '../components/order/OrderProgress'
import { PaymentProofViewer } from '../components/order/PaymentProofViewer'
import type { OrderStatus } from '../data/orderStatus'

type StatusFilter = 'all' | OrderStatus

function customerHasUnread(order: OrderRecord, lastCustomerMsgAt?: string) {
  if (!lastCustomerMsgAt) return false
  const readAt = order.admin_last_read_at
  if (!readAt) return true
  return new Date(lastCustomerMsgAt) > new Date(readAt)
}

export function AdminDashboardPage() {
  const { profile, user, signOut } = useAuth()
  const [orders, setOrders] = useState<OrderWithCustomer[]>([])
  const [customerCount, setCustomerCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [lastCustomerMessageAt, setLastCustomerMessageAt] = useState<
    Record<string, string>
  >({})

  const loadData = async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    setLoading(true)
    setLoadError('')

    try {
      const [ordersRes, profilesRes] = await Promise.all([
        supabase
          .from('orders')
          .select('*, profiles(username)')
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'customer'),
      ])

      if (ordersRes.error) {
        setLoadError(ordersRes.error.message)
      }

      const list = (ordersRes.data as OrderWithCustomer[]) ?? []
      setOrders(list)
      if (profilesRes.count !== null) setCustomerCount(profilesRes.count)

      if (list.length > 0) {
        const ids = list.map((o) => o.id)
        const { data: msgs } = await supabase
          .from('order_messages')
          .select('order_id, created_at')
          .in('order_id', ids)
          .eq('sender_role', 'customer')
          .order('created_at', { ascending: false })

        const map: Record<string, string> = {}
        for (const m of msgs ?? []) {
          if (!map[m.order_id]) map[m.order_id] = m.created_at
        }
        setLastCustomerMessageAt(map)
      }

      if (!selectedOrderId && list[0]) {
        setSelectedOrderId(list[0].id)
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load orders.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const updateOrderStatus = async (orderId: string, status: OrderRecord['status']) => {
    if (!supabase) return
    await supabase.from('orders').update({ status }).eq('id', orderId)

    const selected = orders.find((o) => o.id === orderId)
    if (selected && user) {
      const statusMessages: Partial<Record<OrderRecord['status'], string>> = {
        paid: `Payment verified for order #${orderId.slice(0, 8)}. We're preparing your ${selected.product_name}.`,
        delivered: `Your order has been delivered! Check this chat for your account details. Enjoy!`,
        cancelled: `This order was cancelled. Reply here if you need help.`,
      }
      const body = statusMessages[status]
      if (body) {
        await supabase.from('order_messages').insert({
          order_id: orderId,
          sender_id: user.id,
          sender_role: 'admin',
          body,
        })
      }
    }

    loadData()
  }

  const pendingCount = orders.filter((o) => o.status === 'pending').length
  const unreadOrders = orders.filter((o) =>
    customerHasUnread(o, lastCustomerMessageAt[o.id])
  ).length

  const filteredOrders =
    statusFilter === 'all' ? orders : orders.filter((o) => o.status === statusFilter)

  const selected = orders.find((o) => o.id === selectedOrderId)

  const filterTabs: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'paid', label: 'Paid' },
    { key: 'delivered', label: 'Delivered' },
  ]

  return (
    <div className="relative min-h-screen pt-24">
      <AnimatedBackground />
      <div className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <SectionHeading
              badge="Admin"
              title="Orders & Inbox"
              subtitle={`Welcome, @${profile?.username ?? 'admin'} — verify payments, update status, and message customers.`}
              align="left"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={loadData}
                className="btn-outline inline-flex items-center gap-2 px-4 py-2 text-sm"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <GradientButton onClick={() => signOut()} variant="outline" size="sm">
                <LogOut className="h-4 w-4" />
                Logout
              </GradientButton>
            </div>
          </div>
        </ScrollReveal>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Clock, label: 'Pending payment', value: pendingCount },
            { icon: MessageCircle, label: 'Unread chats', value: unreadOrders },
            { icon: Package, label: 'Total orders', value: orders.length },
            { icon: Users, label: 'Customers', value: customerCount },
          ].map((stat) => (
            <ScrollReveal key={stat.label}>
              <GlassCard className="p-6">
                <stat.icon className="mb-3 h-6 w-6 text-accent-violet" />
                <p className="font-display text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-white/50">{stat.label}</p>
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>

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
          <GlassCard className="p-8 text-center text-white/50">No orders yet.</GlassCard>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                {filterTabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setStatusFilter(tab.key)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      statusFilter === tab.key
                        ? 'bg-accent-violet/30 text-white'
                        : 'bg-white/5 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="max-h-[65vh] space-y-2 overflow-y-auto pr-1">
                {filteredOrders.length === 0 ? (
                  <p className="py-8 text-center text-sm text-white/40">
                    No orders in this filter.
                  </p>
                ) : (
                  filteredOrders.map((order) => {
                    const unread = customerHasUnread(order, lastCustomerMessageAt[order.id])
                    const active = order.id === selectedOrderId
                    const username = order.profiles?.username ?? 'customer'
                    return (
                      <button
                        key={order.id}
                        type="button"
                        onClick={() => setSelectedOrderId(order.id)}
                        className={`w-full rounded-xl border p-4 text-left transition-all ${
                          active
                            ? 'border-accent-violet/50 bg-accent-violet/10'
                            : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-white">
                              {order.product_name}
                            </p>
                            <p className="text-xs text-accent-violet">@{username}</p>
                          </div>
                          {unread && (
                            <span className="shrink-0 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
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
                  })
                )}
              </div>
            </div>

            {selected && (
              <div className="space-y-4">
                <GlassCard className="p-4 sm:p-5">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-xl font-semibold text-white">
                          {selected.product_name}
                        </p>
                        <p className="text-sm text-white/50">
                          @{selected.profiles?.username ?? 'customer'} ·{' '}
                          {formatPrice(Number(selected.amount))} · {selected.payment_method}
                        </p>
                        {selected.notes && (
                          <p className="mt-2 text-sm text-white/60">
                            Customer notes: {selected.notes}
                          </p>
                        )}
                      </div>
                      <OrderStatusBadge status={selected.status} size="md" />
                    </div>

                    <OrderProgress status={selected.status} compact />

                    <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
                      {selected.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(selected.id, 'paid')}
                            className="rounded-lg bg-emerald-600/80 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-600"
                          >
                            ✓ Verify payment
                          </button>
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(selected.id, 'cancelled')}
                            className="rounded-lg border border-red-500/40 px-4 py-2 text-xs font-medium text-red-300 hover:bg-red-500/10"
                          >
                            Cancel order
                          </button>
                        </>
                      )}
                      {selected.status === 'paid' && (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(selected.id, 'delivered')}
                          className="rounded-lg bg-accent-violet/80 px-4 py-2 text-xs font-semibold text-white hover:bg-accent-violet"
                        >
                          Mark delivered
                        </button>
                      )}
                      {selected.status === 'delivered' && (
                        <p className="text-xs text-emerald-400/90">
                          Order complete — customer was notified in chat.
                        </p>
                      )}
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-4">
                  <PaymentProofViewer proofUrl={selected.proof_url} label="Customer payment proof" />
                </GlassCard>

                <OrderChat
                  orderId={selected.id}
                  viewerRole="admin"
                  title="Message Customer"
                  className="min-h-[420px]"
                  onMessageSent={loadData}
                />
              </div>
            )}
          </div>
        )}

        <p className="mt-8 text-center text-xs text-white/30">
          Admin: {user?.email} ·{' '}
          <Link to="/" className="text-accent-violet hover:underline">
            View shop
          </Link>
        </p>
      </div>
    </div>
  )
}
