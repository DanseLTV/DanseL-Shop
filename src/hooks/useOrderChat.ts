import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase, type OrderMessage, type UserRole } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useOrderChat(orderId: string | null, viewerRole: UserRole) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<OrderMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const prevMessageCountRef = useRef(0)

  const loadMessages = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!supabase || !orderId) {
        setMessages([])
        setLoading(false)
        return
      }

      if (!options?.silent) setLoading(true)
      try {
        const { data, error: fetchError } = await supabase
          .from('order_messages')
          .select('*')
          .eq('order_id', orderId)
          .order('created_at', { ascending: true })

        if (fetchError) {
          setError(fetchError.message || 'Could not load messages.')
        } else {
          setMessages((data as OrderMessage[]) ?? [])
          setError('')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load messages.')
      } finally {
        setLoading(false)
      }
    },
    [orderId]
  )

  const markRead = useCallback(async () => {
    if (!supabase || !orderId) return
    const field =
      viewerRole === 'admin' ? 'admin_last_read_at' : 'customer_last_read_at'
    try {
      await supabase
        .from('orders')
        .update({ [field]: new Date().toISOString() })
        .eq('id', orderId)
    } catch (err) {
      console.warn('markRead failed', err)
    }
  }, [orderId, viewerRole])

  useEffect(() => {
    prevMessageCountRef.current = 0
    void loadMessages()
    void markRead()
  }, [orderId, loadMessages, markRead])

  useEffect(() => {
    const client = supabase
    if (!client || !orderId) return

    const channel = client
      .channel(`order-messages-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_messages',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const row = payload.new as OrderMessage
          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev
            return [...prev, row]
          })
          void markRead()
        }
      )
      .subscribe()

    return () => {
      void client.removeChannel(channel)
    }
  }, [orderId, markRead])

  // Scroll only when a new message arrives — not on every re-render or reload
  useEffect(() => {
    const count = messages.length
    if (count > prevMessageCountRef.current && count > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    prevMessageCountRef.current = count
  }, [messages.length])

  const sendMessage = async (body: string) => {
    if (!supabase || !orderId || !user) return false
    const trimmed = body.trim()
    if (!trimmed) return false

    setSending(true)
    setError('')

    const { data, error: insertError } = await supabase
      .from('order_messages')
      .insert({
        order_id: orderId,
        sender_id: user.id,
        sender_role: viewerRole,
        body: trimmed,
      })
      .select()
      .single()

    setSending(false)

    if (insertError) {
      const lower = insertError.message.toLowerCase()
      if (lower.includes('row-level security')) {
        setError('Message blocked by permissions. Make sure schema-messages.sql is run and you own this order.')
      } else if (lower.includes('does not exist')) {
        setError('Chat table missing. Run supabase/schema-messages.sql in the SQL Editor.')
      } else {
        setError(`Could not send: ${insertError.message}`)
      }
      return false
    }

    if (data) {
      const row = data as OrderMessage
      setMessages((prev) => {
        if (prev.some((m) => m.id === row.id)) return prev
        return [...prev, row]
      })
    }

    return true
  }

  return {
    messages,
    loading,
    sending,
    error,
    sendMessage,
    bottomRef,
    reload: () => loadMessages({ silent: true }),
  }
}
