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
    loadData()
  }

  const pendingCount = orders.filter((o) => o.status === 'pending').length
  const unreadOrders = orders.filter((o) =>
    customerHasUnread(o, lastCustomerMessageAt[o.id])
  ).length
  const selected = orders.find((o) => o.id === selectedOrderId)

  return (
    <div className="relative min-h-screen pt-24">
      <AnimatedBackground />
      <div className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <SectionHeading
              badge="Admin"
              title="Dashboard & Inbox"
              subtitle={`Welcome, @${profile?.username ?? 'admin'} — manage orders and message customers here.`}
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

        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Clock, label: 'Pending Orders', value: pendingCount },
            { icon: MessageCircle, label: 'Unread Chats', value: unreadOrders },
            { icon: Package, label: 'Total Orders', value: orders.length },
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
          <p className="text-white/50">Loading…</p>
        ) : orders.length === 0 ? (
          <GlassCard className="p-8 text-center text-white/50">
            No orders yet.
          </GlassCard>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
            <div className="max-h-[70vh] space-y-2 overflow-y-auto pr-1">
              <h2 className="mb-3 font-display text-lg font-semibold text-white">
                Orders
              </h2>
              {orders.map((order) => {
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
                      <div>
                        <p className="font-medium text-white">{order.product_name}</p>
                        <p className="text-xs text-accent-violet">@{username}</p>
                      </div>
                      {unread && (
                        <span className="shrink-0 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                          New
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-white/50">
                      {formatPrice(Number(order.amount))} · {order.status} ·{' '}
                      {order.payment_method}
                    </p>
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
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-display text-xl font-semibold text-white">
                        {selected.product_name}
                      </p>
                      <p className="text-sm text-white/50">
                        @{selected.profiles?.username ?? 'customer'} ·{' '}
                        {formatPrice(Number(selected.amount))}
                      </p>
                      {selected.notes && (
                        <p className="mt-2 text-sm text-white/60">
                          Notes: {selected.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          selected.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-400'
                            : selected.status === 'delivered'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-white/10 text-white/60'
                        }`}
                      >
                        {selected.status}
                      </span>
                      {selected.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(selected.id, 'paid')}
                            className="rounded-lg bg-emerald-600/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600"
                          >
                            Mark Paid
                          </button>
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(selected.id, 'delivered')}
                            className="rounded-lg bg-accent-violet/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-violet"
                          >
                            Delivered
                          </button>
                        </>
                      )}
                      {selected.status === 'paid' && (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(selected.id, 'delivered')}
                          className="rounded-lg bg-accent-violet/80 px-3 py-1.5 text-xs font-medium text-white"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>
                </GlassCard>

                <OrderChat
                  orderId={selected.id}
                  viewerRole="admin"
                  title="Message Customer"
                  className="min-h-[420px]"
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
