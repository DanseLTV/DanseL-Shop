import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Users, Clock, LogOut, RefreshCw } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase, type OrderRecord } from '../lib/supabase'
import { formatPrice } from '../data/products'
import { AnimatedBackground } from '../components/ui/AnimatedBackground'
import { ScrollReveal } from '../components/ui/ScrollReveal'
import { SectionHeading } from '../components/ui/SectionHeading'
import { GradientButton } from '../components/ui/GradientButton'
import { GlassCard } from '../components/ui/GlassCard'

export function AdminDashboardPage() {
  const { profile, user, signOut } = useAuth()
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [customerCount, setCustomerCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    if (!supabase) return
    setLoading(true)

    const [ordersRes, profilesRes] = await Promise.all([
      supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
    ])

    if (ordersRes.data) setOrders(ordersRes.data as OrderRecord[])
    if (profilesRes.count !== null) setCustomerCount(profilesRes.count)
    setLoading(false)
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

  return (
    <div className="relative min-h-screen pt-24">
      <AnimatedBackground />
      <div className="relative mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <SectionHeading
              badge="Admin"
              title="Dashboard"
              subtitle={`Welcome, ${profile?.full_name ?? 'Admin'}`}
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

        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Clock, label: 'Pending Orders', value: pendingCount },
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

        <ScrollReveal>
          <h2 className="mb-4 font-display text-xl font-semibold text-white">Recent Orders</h2>
          {loading ? (
            <p className="text-white/50">Loading orders…</p>
          ) : orders.length === 0 ? (
            <GlassCard className="p-8 text-center text-white/50">
              No orders yet. Orders appear here when customers submit via the site.
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <GlassCard key={order.id} className="p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-white">{order.product_name}</p>
                      <p className="text-sm text-white/50">
                        {formatPrice(Number(order.amount))} · {order.payment_method} ·{' '}
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          order.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-400'
                            : order.status === 'delivered'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-white/10 text-white/60'
                        }`}
                      >
                        {order.status}
                      </span>
                      {order.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(order.id, 'paid')}
                            className="rounded-lg bg-emerald-600/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600"
                          >
                            Mark Paid
                          </button>
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                            className="rounded-lg bg-accent-violet/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-violet"
                          >
                            Delivered
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </ScrollReveal>

        <p className="mt-8 text-center text-xs text-white/30">
          Admin: {user?.email} · <Link to="/" className="text-accent-violet hover:underline">View shop</Link>
        </p>
      </div>
    </div>
  )
}
