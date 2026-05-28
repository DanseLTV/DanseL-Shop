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

  const loadMessages = useCallback(async () => {
    if (!supabase || !orderId) {
      setMessages([])
      setLoading(false)
      return
    }

    setLoading(true)
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
  }, [orderId])

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
    loadMessages()
    markRead()
  }, [loadMessages, markRead])

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (body: string) => {
    if (!supabase || !orderId || !user) return false
    const trimmed = body.trim()
    if (!trimmed) return false

    setSending(true)
    setError('')

    const { error: insertError } = await supabase.from('order_messages').insert({
      order_id: orderId,
      sender_id: user.id,
      sender_role: viewerRole,
      body: trimmed,
    })

    setSending(false)

    if (insertError) {
      setError('Message could not be sent. Please try again.')
      return false
    }

    await loadMessages()
    return true
  }

  return {
    messages,
    loading,
    sending,
    error,
    sendMessage,
    bottomRef,
    reload: loadMessages,
  }
}
