import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  supabase,
  activeMessagesOnly,
  type OrderMessage,
  type UserRole,
} from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import {
  notifyAdminsCustomerMessage,
  notifyRecipientNewMessage,
} from '../utils/notifications'
import { customerOrderLink } from '../constants/orderNotifications'

export function useOrderChat(
  orderId: string | null,
  viewerRole: UserRole,
  includeDeleted = false
) {
  const { user, profile } = useAuth()
  const [messages, setMessages] = useState<OrderMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [moderating, setModerating] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const prevMessageCountRef = useRef(0)

  const visibleMessages = useMemo(
    () => (includeDeleted ? messages : activeMessagesOnly(messages)),
    [messages, includeDeleted]
  )

  const deletedCount = useMemo(
    () => messages.filter((m) => m.deleted_at).length,
    [messages]
  )

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
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'order_messages',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const row = payload.new as OrderMessage
          setMessages((prev) => {
            const idx = prev.findIndex((m) => m.id === row.id)
            if (idx === -1) return [...prev, row]
            const next = [...prev]
            next[idx] = row
            return next
          })
        }
      )
      .subscribe()

    return () => {
      void client.removeChannel(channel)
    }
  }, [orderId, markRead])

  useEffect(() => {
    const count = visibleMessages.length
    if (count > prevMessageCountRef.current && count > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
    prevMessageCountRef.current = count
  }, [visibleMessages.length])

  const mapModerationError = (message: string, action: string) => {
    const lower = message.toLowerCase()
    if (lower.includes('row-level security')) {
      return `${action} blocked: run supabase/schema-order-chat-soft-delete.sql and ensure admin role.`
    }
    return `Could not ${action.toLowerCase()}: ${message}`
  }

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
        setError(
          viewerRole === 'admin'
            ? 'Message blocked: admin role or chat policy missing. Run supabase/patch-admin-rls-storage-chat.sql and set profiles.role = admin.'
            : 'Message blocked: you can only chat on your own orders.'
        )
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

      if (viewerRole === 'admin') {
        const { data: orderRow } = await supabase
          .from('orders')
          .select('user_id')
          .eq('id', orderId)
          .maybeSingle()

        if (orderRow?.user_id) {
          await notifyRecipientNewMessage({
            orderId,
            recipientUserId: orderRow.user_id,
            senderLabel: 'DANSEL SHOP',
            messageBody: trimmed,
            linkPath: customerOrderLink(orderId),
          })
        }
      } else {
        await notifyAdminsCustomerMessage({
          orderId,
          customerUsername: profile?.username,
          messageBody: trimmed,
        })
      }
    }

    return true
  }

  const updateMessage = async (messageId: string, body: string) => {
    if (!supabase || !user || viewerRole !== 'admin') return false
    const trimmed = body.trim()
    if (!trimmed) return false

    setModerating(true)
    setError('')

    const { data, error: updateError } = await supabase
      .from('order_messages')
      .update({ body: trimmed, updated_at: new Date().toISOString() })
      .eq('id', messageId)
      .eq('sender_id', user.id)
      .eq('sender_role', 'admin')
      .is('deleted_at', null)
      .select()
      .single()

    setModerating(false)

    if (updateError) {
      setError(mapModerationError(updateError.message, 'Update'))
      return false
    }

    if (data) {
      const row = data as OrderMessage
      setMessages((prev) => prev.map((m) => (m.id === row.id ? row : m)))
    }
    return true
  }

  const softDeleteMessage = async (messageId: string) => {
    if (!supabase || !user || viewerRole !== 'admin') return false

    setModerating(true)
    setError('')

    const now = new Date().toISOString()
    const { data, error: updateError } = await supabase
      .from('order_messages')
      .update({ deleted_at: now, deleted_by: user.id })
      .eq('id', messageId)
      .eq('sender_id', user.id)
      .eq('sender_role', 'admin')
      .is('deleted_at', null)
      .select()
      .single()

    setModerating(false)

    if (updateError) {
      setError(mapModerationError(updateError.message, 'Unsend'))
      return false
    }

    if (data) {
      const row = data as OrderMessage
      setMessages((prev) => prev.map((m) => (m.id === row.id ? row : m)))
    }
    return true
  }

  const softDeleteConversation = async () => {
    if (!supabase || !orderId || !user || viewerRole !== 'admin') return false

    setModerating(true)
    setError('')

    const now = new Date().toISOString()
    const { data, error: updateError } = await supabase
      .from('order_messages')
      .update({ deleted_at: now, deleted_by: user.id })
      .eq('order_id', orderId)
      .is('deleted_at', null)
      .select()

    setModerating(false)

    if (updateError) {
      setError(mapModerationError(updateError.message, 'Clear conversation'))
      return false
    }

    if (data?.length) {
      const rows = data as OrderMessage[]
      setMessages((prev) => {
        const map = new Map(rows.map((r) => [r.id, r]))
        return prev.map((m) => map.get(m.id) ?? m)
      })
    }
    return true
  }

  return {
    messages: visibleMessages,
    allMessages: messages,
    deletedCount,
    loading,
    sending,
    moderating,
    error,
    sendMessage,
    updateMessage,
    deleteMessage: softDeleteMessage,
    deleteConversation: softDeleteConversation,
    bottomRef,
    reload: () => loadMessages({ silent: true }),
  }
}
