import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, MessageCircle, Package, Users, Inbox, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { AdminFinancePanel } from '../../components/admin/AdminFinancePanel'
import {
  AdminSnapshotPanel,
  type SnapshotKind,
} from '../../components/admin/AdminSnapshotPanel'

export function AdminOverviewPage() {
  const [pendingCount, setPendingCount] = useState(0)
  const [orderCount, setOrderCount] = useState(0)
  const [customerCount, setCustomerCount] = useState(0)
  const [productCount, setProductCount] = useState(0)
  const [activeSnapshot, setActiveSnapshot] = useState<SnapshotKind | null>(null)

  const loadStats = useCallback(async () => {
    if (!supabase) return
    const [ordersRes, customersRes, productsRes] = await Promise.all([
      supabase.from('orders').select('id, status'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
      supabase.from('shop_products').select('id', { count: 'exact', head: true }),
    ])
    const orders = ordersRes.data ?? []
    setOrderCount(orders.length)
    setPendingCount(orders.filter((o) => o.status === 'pending').length)
    if (customersRes.count != null) setCustomerCount(customersRes.count)
    if (productsRes.count != null) setProductCount(productsRes.count)
  }, [])

  useEffect(() => {
    void loadStats()
  }, [loadStats])

  const snapshots: {
    kind: SnapshotKind
    icon: typeof Clock
    label: string
    value: number
  }[] = [
    { kind: 'pending', icon: Clock, label: 'Pending payment', value: pendingCount },
    { kind: 'orders', icon: MessageCircle, label: 'Total orders', value: orderCount },
    { kind: 'customers', icon: Users, label: 'Customers', value: customerCount },
    { kind: 'products', icon: Package, label: 'Products', value: productCount },
  ]

  const shortcuts = [
    {
      to: '/admin/orders',
      icon: Inbox,
      title: 'Orders & customer chat',
      desc: 'Verify payments, update status, reply to messages',
      color: 'from-violet-600/20 to-indigo-600/10',
    },
    {
      to: '/admin/products',
      icon: Package,
      title: 'Product catalog',
      desc: 'Bulk visibility, featured flags, add & edit products',
      color: 'from-cyan-600/15 to-teal-600/10',
    },
  ]

  return (
    <div className="p-4 sm:p-6">
      <p className="text-lead !text-base">
        Quick snapshot — tap a card to view details.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {snapshots.map((s) => (
          <button
            key={s.kind}
            type="button"
            onClick={() => setActiveSnapshot(s.kind)}
            className="group rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition-all hover:border-brand/40 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
          >
            <div className="mb-2 flex items-center justify-between">
              <s.icon className="h-5 w-5 text-brand-bright" />
              <ChevronRight className="h-4 w-4 text-white/25 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-bright" />
            </div>
            <p className="font-display text-3xl font-bold tabular-nums tracking-tight text-white">{s.value}</p>
            <p className="text-caption group-hover:text-white/65">{s.label}</p>
          </button>
        ))}
      </div>

      <AdminSnapshotPanel
        kind={activeSnapshot}
        onClose={() => setActiveSnapshot(null)}
      />

      <AdminFinancePanel />

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {shortcuts.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`group flex items-center gap-4 rounded-xl border border-white/10 bg-gradient-to-br ${item.color} p-4 transition-colors hover:border-brand/40`}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10">
              <item.icon className="h-5 w-5 text-brand-bright" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium tracking-tight text-white group-hover:text-brand-bright">{item.title}</p>
              <p className="text-caption mt-0.5">{item.desc}</p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-white/30 group-hover:text-white" />
          </Link>
        ))}
      </div>
    </div>
  )
}
