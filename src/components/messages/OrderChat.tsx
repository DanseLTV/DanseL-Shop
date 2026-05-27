import { useState } from 'react'
import { MessageCircle, Send } from 'lucide-react'
import { useOrderChat } from '../../hooks/useOrderChat'
import { useAuth } from '../../context/AuthContext'
import type { UserRole } from '../../lib/supabase'
import { GradientButton } from '../ui/GradientButton'

interface OrderChatProps {
  orderId: string
  viewerRole: UserRole
  title?: string
  className?: string
}

export function OrderChat({
  orderId,
  viewerRole,
  title = 'Messages',
  className = '',
}: OrderChatProps) {
  const { user } = useAuth()
  const [draft, setDraft] = useState('')
  const { messages, loading, sending, error, sendMessage, bottomRef } =
    useOrderChat(orderId, viewerRole)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await sendMessage(draft)
    if (ok) setDraft('')
  }

  return (
    <div className={`flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] ${className}`}>
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <MessageCircle className="h-5 w-5 text-accent-violet" />
        <h3 className="font-display text-sm font-semibold text-white">{title}</h3>
        <span className="ml-auto text-xs text-white/40">Live chat with admin</span>
      </div>

      <div className="flex max-h-80 min-h-[200px] flex-1 flex-col overflow-y-auto px-4 py-3">
        {loading ? (
          <p className="m-auto text-sm text-white/40">Loading messages…</p>
        ) : messages.length === 0 ? (
          <p className="m-auto text-center text-sm text-white/40">
            No messages yet. Say hello or ask about your order — we&apos;ll reply here.
          </p>
        ) : (
          <ul className="space-y-3">
            {messages.map((msg) => {
              const isMine = msg.sender_id === user?.id
              return (
                <li
                  key={msg.id}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                      isMine
                        ? 'rounded-br-md bg-gradient-to-br from-accent-violet to-accent-purple text-white'
                        : 'rounded-bl-md border border-white/10 bg-white/10 text-white/90'
                    }`}
                  >
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider opacity-70">
                      {msg.sender_role === 'admin' ? 'DANSEL SHOP' : 'You'}
                    </p>
                    <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                    <p className="mt-1 text-[10px] opacity-60">
                      {new Date(msg.created_at).toLocaleString()}
                    </p>
                  </div>
                </li>
              )
            })}
            <div ref={bottomRef} />
          </ul>
        )}
      </div>

      {error && (
        <p className="px-4 pb-2 text-xs text-red-300">{error}</p>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex gap-2 border-t border-white/10 p-3"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={
            viewerRole === 'admin'
              ? 'Reply to customer…'
              : 'Message admin about your order…'
          }
          maxLength={4000}
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-accent-violet/50 focus:outline-none"
        />
        <GradientButton type="submit" size="sm" disabled={sending || !draft.trim()}>
          <Send className="h-4 w-4" />
        </GradientButton>
      </form>
    </div>
  )
}
