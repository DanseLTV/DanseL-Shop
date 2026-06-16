import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, ChevronRight, LogIn, Inbox } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { supabase, type OrderRecord, type UserRole } from '../../lib/supabase'

interface Convo {
  order: OrderRecord
  lastBody: string
  lastAt: string
  lastRole: UserRole | null
  unread: boolean
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'now'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  return `${d}d`
}

export function FloatingMessageButton() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [open, setOpen] = useState(false)
  const [convos, setConvos] = useState<Convo[]>([])
  const [fetching, setFetching] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    if (!supabase || !user) return
    setFetching(true)
    try {
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      const orders = (ordersData as OrderRecord[]) ?? []
      const byId = new Map(orders.map((o) => [o.id, o]))

      const lastMsg: Record<string, { body: string; at: string; role: UserRole }> = {}
      if (orders.length > 0) {
        const { data: msgs } = await supabase
          .from('order_messages')
          .select('order_id, body, created_at, sender_role')
          .in(
            'order_id',
            orders.map((o) => o.id)
          )
          .order('created_at', { ascending: false })

        for (const m of (msgs ?? []) as Array<{
          order_id: string
          body: string
          created_at: string
          sender_role: UserRole
        }>) {
          if (!lastMsg[m.order_id]) {
            lastMsg[m.order_id] = { body: m.body, at: m.created_at, role: m.sender_role }
          }
        }
      }

      const list: Convo[] = orders.map((order) => {
        const last = lastMsg[order.id]
        const readAt = order.customer_last_read_at
        const unread =
          !!last &&
          last.role === 'admin' &&
          (!readAt || new Date(last.at) > new Date(readAt))
        return {
          order,
          lastBody: last?.body ?? 'No messages yet — tap to start the chat.',
          lastAt: last?.at ?? order.created_at,
          lastRole: last?.role ?? null,
          unread,
        }
      })

      list.sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime())
      void byId
      setConvos(list)
    } finally {
      setFetching(false)
    }
  }, [user])

  // Refresh when the popover opens.
  useEffect(() => {
    if (open && user) void load()
  }, [open, user, load])

  // Background unread count for the badge.
  useEffect(() => {
    if (user) void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (loading) return null
  if (location.pathname.startsWith('/admin')) return null
  if (location.pathname.startsWith('/orders')) return null
  if (location.pathname === '/login' || location.pathname === '/signup') return null

  const unreadCount = convos.filter((c) => c.unread).length

  const openConvo = (orderId: string) => {
    setOpen(false)
    navigate(`/orders?order=${encodeURIComponent(orderId)}`)
  }

  return (
    <div
      ref={containerRef}
      className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-50 flex flex-col items-end gap-3 lg:bottom-6 lg:right-6"
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="flex w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-white/12 bg-midnight-900/95 shadow-glass backdrop-blur-xl"
            role="dialog"
            aria-label="Messages"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-white" />
                <span className="text-sm font-semibold text-white">Messages</span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white"
                aria-label="Close messages"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[22rem] scroll-y">
              {!user ? (
                <div className="px-4 py-8 text-center">
                  <Inbox className="mx-auto mb-3 h-8 w-8 text-white/30" />
                  <p className="text-sm text-white/60">
                    Sign in to view your order messages.
                  </p>
                  <Link
                    to="/login?redirect=%2Forders"
                    onClick={() => setOpen(false)}
                    className="btn-glow mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm"
                  >
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Link>
                </div>
              ) : fetching && convos.length === 0 ? (
                <div className="space-y-2 p-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-14 animate-pulse rounded-xl bg-white/5" />
                  ))}
                </div>
              ) : convos.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Inbox className="mx-auto mb-3 h-8 w-8 text-white/30" />
                  <p className="text-sm text-white/60">No orders yet.</p>
                  <Link
                    to="/shop"
                    onClick={() => setOpen(false)}
                    className="btn-outline mt-4 inline-flex px-4 py-2 text-sm"
                  >
                    Browse the shop
                  </Link>
                </div>
              ) : (
                <ul className="p-2">
                  {convos.slice(0, 6).map((c) => (
                    <li key={c.order.id}>
                      <button
                        type="button"
                        onClick={() => openConvo(c.order.id)}
                        className="flex w-full items-start gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-white/5"
                      >
                        <span className="relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-bold text-white">
                          {c.order.product_name?.[0]?.toUpperCase() ?? 'O'}
                          {c.unread && (
                            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-white ring-2 ring-midnight-900" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <span
                              className={`truncate text-sm ${c.unread ? 'font-semibold text-white' : 'font-medium text-white/85'}`}
                            >
                              {c.order.product_name}
                            </span>
                            <span className="shrink-0 text-[10px] text-white/40">
                              {timeAgo(c.lastAt)}
                            </span>
                          </span>
                          <span
                            className={`mt-0.5 block truncate text-xs ${c.unread ? 'text-white/80' : 'text-white/45'}`}
                          >
                            {c.lastRole === 'customer' ? 'You: ' : ''}
                            {c.lastBody}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer — view full page */}
            {user && convos.length > 0 && (
              <Link
                to="/orders"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-1.5 border-t border-white/10 px-4 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/5 hover:text-white"
              >
                View all messages
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating launcher */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-white text-midnight-950 shadow-glow transition-transform hover:scale-105"
        aria-label="Open messages"
        aria-expanded={open ? 'true' : 'false'}
        title="Messages"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-midnight-950">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  )
}
