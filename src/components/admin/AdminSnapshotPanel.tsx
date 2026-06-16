import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, Loader2 } from 'lucide-react'
import { supabase, type OrderWithCustomer, type UserProfile } from '../../lib/supabase'
import { products as staticProducts } from '../../data/products'
import { formatPrice } from '../../data/products'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import { OrderStatusBadge } from '../order/OrderStatusBadge'
import type { ShopProductRow } from '../../utils/shopProductMapper'

export type SnapshotKind = 'pending' | 'orders' | 'customers' | 'products'

interface AdminSnapshotPanelProps {
  kind: SnapshotKind | null
  onClose: () => void
}

const meta: Record<
  SnapshotKind,
  { title: string; description: string; actionTo: string; actionLabel: string }
> = {
  pending: {
    title: 'Pending payment',
    description: 'Orders waiting for you to verify payment proof.',
    actionTo: '/admin/orders?status=pending',
    actionLabel: 'Open in Orders',
  },
  orders: {
    title: 'Total orders',
    description: 'All customer orders — newest first.',
    actionTo: '/admin/orders',
    actionLabel: 'View all orders',
  },
  customers: {
    title: 'Customers',
    description: 'Registered customer accounts on the shop.',
    actionTo: '/admin/orders',
    actionLabel: 'View orders',
  },
  products: {
    title: 'Products',
    description: 'Items in your shop catalog.',
    actionTo: '/admin/products',
    actionLabel: 'Manage products',
  },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AdminSnapshotPanel({ kind, onClose }: AdminSnapshotPanelProps) {
  const open = kind !== null
  useBodyScrollLock(open)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orders, setOrders] = useState<OrderWithCustomer[]>([])
  const [customers, setCustomers] = useState<UserProfile[]>([])
  const [products, setProducts] = useState<ShopProductRow[]>([])

  const load = useCallback(async (snapshot: SnapshotKind) => {
    if (!supabase) {
      setError('Supabase is not configured.')
      return
    }
    setLoading(true)
    setError('')
    try {
      if (snapshot === 'pending' || snapshot === 'orders') {
        let query = supabase
          .from('orders')
          .select('*, profiles(username)')
          .order('created_at', { ascending: false })
          .limit(snapshot === 'pending' ? 50 : 20)
        if (snapshot === 'pending') {
          query = query.eq('status', 'pending')
        }
        const { data, error: qError } = await query
        if (qError) throw qError
        setOrders((data as OrderWithCustomer[]) ?? [])
      } else if (snapshot === 'customers') {
        const { data, error: qError } = await supabase
          .from('profiles')
          .select('id, username, email, role, created_at')
          .eq('role', 'customer')
          .order('created_at', { ascending: false })
          .limit(50)
        if (qError) throw qError
        setCustomers((data as UserProfile[]) ?? [])
      } else {
        const { data, error: qError } = await supabase
          .from('shop_products')
          .select('id, name, category, price, availability, enabled')
          .order('sort_order', { ascending: true })
          .limit(50)
        if (qError) throw qError
        const rows = (data as ShopProductRow[]) ?? []
        if (rows.length === 0) {
          setProducts(
            staticProducts.map((p) => ({
              id: p.id,
              name: p.name,
              category: p.category,
              description: p.description,
              price: p.price,
              duration: p.duration,
              availability: p.availability,
              featured: p.featured ?? false,
              badge: p.badge ?? null,
              features: p.features,
              image_gradient: p.imageGradient,
              image: p.image ?? null,
              image_fit: p.imageFit ?? 'cover',
              enabled: true,
              sort_order: 0,
            }))
          )
        } else {
          setProducts(rows)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load details.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!kind) return
    setOrders([])
    setCustomers([])
    setProducts([])
    void load(kind)
  }, [kind, load])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!kind) return null

  const info = meta[kind]

  const body = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      )
    }
    if (error) {
      return (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )
    }

    if (kind === 'pending' || kind === 'orders') {
      if (orders.length === 0) {
        return (
          <p className="py-10 text-center text-sm text-white/45">
            {kind === 'pending' ? 'No pending orders right now.' : 'No orders yet.'}
          </p>
        )
      }
      return (
        <ul className="space-y-2">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                to={`/admin/orders?order=${encodeURIComponent(order.id)}${kind === 'pending' ? '&status=pending' : ''}`}
                onClick={onClose}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 transition-colors hover:border-brand/40 hover:bg-white/[0.06]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{order.product_name}</p>
                  <p className="mt-0.5 text-xs text-white/45">
                    @{order.profiles?.username ?? 'customer'} · {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-sm font-semibold text-white">
                    {formatPrice(Number(order.amount))}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )
    }

    if (kind === 'customers') {
      if (customers.length === 0) {
        return <p className="py-10 text-center text-sm text-white/45">No customers yet.</p>
      }
      return (
        <ul className="space-y-2">
          {customers.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">@{c.username}</p>
                <p className="truncate text-xs text-white/45">{c.email}</p>
              </div>
              {c.created_at && (
                <span className="shrink-0 text-xs text-white/35">{formatDate(c.created_at)}</span>
              )}
            </li>
          ))}
        </ul>
      )
    }

    if (products.length === 0) {
      return <p className="py-10 text-center text-sm text-white/45">No products in catalog.</p>
    }
    return (
      <ul className="space-y-2">
        {products.map((p) => (
          <li key={p.id}>
            <Link
              to={`/admin/products/${encodeURIComponent(p.id)}`}
              onClick={onClose}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 transition-colors hover:border-brand/40 hover:bg-white/[0.06]"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{p.name}</p>
                <p className="text-xs text-white/45">{p.category}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-sm font-semibold text-white">{formatPrice(p.price)}</span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                    p.enabled !== false
                      ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400'
                      : 'border-white/15 bg-white/5 text-white/40'
                  }`}
                >
                  {p.enabled !== false ? p.availability : 'Hidden'}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    )
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-end justify-center p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="snapshot-panel-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close"
          />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-[1] flex max-h-[88dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-[#0c0d14] shadow-2xl sm:max-h-[85vh] sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 border-b border-white/10 px-5 py-4">
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
              <h2 id="snapshot-panel-title" className="font-display text-lg font-semibold text-white">
                {info.title}
              </h2>
              <p className="mt-1 text-sm text-white/50">{info.description}</p>
            </div>

            <div className="min-h-0 flex-1 scroll-y px-5 py-4">
              {body()}
            </div>

            <div className="shrink-0 border-t border-white/10 px-5 py-4">
              <Link
                to={info.actionTo}
                onClick={onClose}
                className="btn-glow inline-flex w-full items-center justify-center gap-2 py-3 text-sm"
              >
                {info.actionLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
