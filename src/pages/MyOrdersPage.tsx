import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, MessageCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase, type OrderRecord } from '../lib/supabase'
import { formatPrice } from '../data/products'
import { AnimatedBackground } from '../components/ui/AnimatedBackground'
import { ScrollReveal } from '../components/ui/ScrollReveal'
import { SectionHeading } from '../components/ui/SectionHeading'
import { GlassCard } from '../components/ui/GlassCard'
import { OrderChat } from '../components/messages/OrderChat'
import { GradientButton } from '../components/ui/GradientButton'

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
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [lastAdminMessageAt, setLastAdminMessageAt] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const selectedId = paramOrderId ?? orders[0]?.id ?? null

  const loadOrders = async () => {
    if (!supabase || !user) return
    setLoading(true)

    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

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

    setLoading(false)
  }

  useEffect(() => {
    loadOrders()
  }, [user])

  useEffect(() => {
    if (!paramOrderId && orders[0]) {
      navigate(`/orders/${orders[0].id}`, { replace: true })
    }
  }, [orders, paramOrderId, navigate])

  const selectOrder = (id: string) => {
    navigate(`/orders/${id}`, { replace: true })
  }

  const selected = orders.find((o) => o.id === selectedId)

  return (
    <div className="relative min-h-screen pt-24">
      <AnimatedBackground />
      <div className="relative mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <Link
          to="/account"
          className="mb-6 inline-flex items-center gap-2 text-sm text-white/50 hover:text-accent-violet"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to account
        </Link>

        <ScrollReveal>
          <SectionHeading
            badge="Orders"
            title="My Orders & Messages"
            subtitle="Chat with DANSEL SHOP admin about your orders — no need to leave the site."
            align="left"
          />
        </ScrollReveal>

        {loading ? (
          <p className="text-white/50">Loading…</p>
        ) : orders.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <Package className="mx-auto h-10 w-10 text-white/30" />
            <p className="mt-4 text-white/60">You have no orders yet.</p>
            <GradientButton to="/order" className="mt-6">
              Place your first order
            </GradientButton>
          </GlassCard>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
            <div className="space-y-2">
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
                      <p className="font-medium text-white">{order.product_name}</p>
                      {unread && (
                        <span className="shrink-0 rounded-full bg-accent-cyan/20 px-2 py-0.5 text-[10px] font-bold text-accent-cyan">
                          New
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-white/50">
                      {formatPrice(Number(order.amount))} · {order.status}
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
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-display text-lg font-semibold text-white">
                        {selected.product_name}
                      </p>
                      <p className="text-sm text-white/50">
                        Order #{selected.id.slice(0, 8)} · {selected.status}
                      </p>
                    </div>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                      {selected.payment_method}
                    </span>
                  </div>
                </GlassCard>

                <OrderChat
                  orderId={selected.id}
                  viewerRole="customer"
                  title="Chat with Admin"
                />

                <p className="flex items-center gap-2 text-xs text-white/40">
                  <MessageCircle className="h-3.5 w-3.5" />
                  You can also reach us on Telegram if needed — but we reply here first.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
