import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ClipboardList } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { supabase, type OrderRecord } from '../../lib/supabase'
import { formatPrice } from '../../data/products'
import { OrderStatusBadge } from './OrderStatusBadge'

/**
 * Compact "your recent orders" strip so signed-in customers can see at a
 * glance which orders are pending, in process, delivered, or cancelled.
 * Renders nothing for guests or when there are no orders.
 */
export function MyOrdersStrip({ className = '' }: { className?: string }) {
  const { user } = useAuth()
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let active = true
    const load = async () => {
      if (!supabase || !user) {
        setLoaded(true)
        return
      }
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(6)
      if (!active) return
      setOrders((data as OrderRecord[]) ?? [])
      setLoaded(true)
    }
    void load()
    return () => {
      active = false
    }
  }, [user])

  if (!user || !loaded || orders.length === 0) return null

  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl sm:p-5 ${className}`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-brand">
            <ClipboardList className="h-4 w-4" />
          </span>
          <div>
            <p className="font-display text-sm font-semibold tracking-tight text-white">Your orders</p>
            <p className="text-caption">Track status & chat with admin</p>
          </div>
        </div>
        <Link
          to="/orders"
          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-brand-bright transition-colors hover:bg-white/5"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="flex gap-3 scroll-x pb-1 scrollbar-thin">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/orders?order=${encodeURIComponent(order.id)}`}
            className="group flex w-56 shrink-0 flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 transition-all hover:border-brand/40 hover:bg-white/[0.07]"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="line-clamp-1 text-sm font-medium text-white">
                {order.product_name}
              </p>
            </div>
            <div className="flex items-center justify-between gap-2">
              <OrderStatusBadge status={order.status} />
              <span className="text-xs text-white/50">
                {formatPrice(Number(order.amount))}
              </span>
            </div>
            <p className="text-[11px] text-white/35">
              {new Date(order.created_at).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
