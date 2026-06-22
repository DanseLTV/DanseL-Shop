import { useEffect, useRef, useState } from 'react'
import {
  MessageCircle,
  Send,
  MoreVertical,
  Pencil,
  Trash2,
  X,
  Check,
  MessageSquareX,
  History,
} from 'lucide-react'
import { useOrderChat } from '../../hooks/useOrderChat'
import { useAuth } from '../../context/AuthContext'
import { isMessageDeleted, type OrderMessage, type UserRole } from '../../lib/supabase'
import { shopContact } from '../../data/shopContact'
import { GradientButton } from '../ui/GradientButton'

interface OrderChatProps {
  orderId: string
  viewerRole: UserRole
  customerUsername?: string
  title?: string
  className?: string
  onMessageSent?: () => void
  onConversationChanged?: () => void
}

function formatCustomerHandle(username?: string | null) {
  return username ? `@${username}` : '@customer'
}

function messageSenderLabel(
  msg: OrderMessage,
  viewerRole: UserRole,
  isAdminViewer: boolean,
  customerHandle: string
) {
  if (msg.sender_role === 'admin') {
    if (isAdminViewer && msg.sender_role === viewerRole) {
      return `You · ${shopContact.chatSenderShort}`
    }
    return shopContact.chatSenderLabel
  }
  if (isAdminViewer) return customerHandle
  return `You · ${customerHandle}`
}

function isEdited(msg: OrderMessage) {
  if (!msg.updated_at) return false
  return new Date(msg.updated_at).getTime() > new Date(msg.created_at).getTime() + 1000
}

export function OrderChat({
  orderId,
  viewerRole,
  customerUsername,
  title = 'Messages',
  className = '',
  onMessageSent,
  onConversationChanged,
}: OrderChatProps) {
  const { user, profile } = useAuth()
  const [draft, setDraft] = useState('')
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false)
  const [activeMessageMenu, setActiveMessageMenu] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)
  const [confirmUnsendId, setConfirmUnsendId] = useState<string | null>(null)
  const [showDeletedHistory, setShowDeletedHistory] = useState(false)

  const headerMenuRef = useRef<HTMLDivElement>(null)
  const isAdmin = viewerRole === 'admin'
  const customerHandle = formatCustomerHandle(customerUsername ?? profile?.username)

  const {
    messages,
    deletedCount,
    loading,
    sending,
    moderating,
    error,
    sendMessage,
    updateMessage,
    deleteMessage,
    deleteConversation,
    bottomRef,
  } = useOrderChat(orderId, viewerRole, isAdmin && showDeletedHistory)

  const activeMessageCount = showDeletedHistory
    ? messages.filter((m) => !m.deleted_at).length
    : messages.length

  useEffect(() => {
    setHeaderMenuOpen(false)
    setActiveMessageMenu(null)
    setEditingId(null)
    setConfirmClear(false)
    setConfirmUnsendId(null)
    setShowDeletedHistory(false)
  }, [orderId])

  useEffect(() => {
    if (!headerMenuOpen) return
    const onPointerDown = (e: MouseEvent) => {
      if (headerMenuRef.current && !headerMenuRef.current.contains(e.target as Node)) {
        setHeaderMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [headerMenuOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await sendMessage(draft)
    if (ok) {
      setDraft('')
      onMessageSent?.()
      onConversationChanged?.()
    }
  }

  const startEdit = (msg: OrderMessage) => {
    setEditingId(msg.id)
    setEditDraft(msg.body)
    setActiveMessageMenu(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditDraft('')
  }

  const saveEdit = async () => {
    if (!editingId) return
    const ok = await updateMessage(editingId, editDraft)
    if (ok) {
      setEditingId(null)
      setEditDraft('')
      onConversationChanged?.()
    }
  }

  const handleUnsend = async (messageId: string) => {
    const ok = await deleteMessage(messageId)
    if (ok) {
      setConfirmUnsendId(null)
      onConversationChanged?.()
    }
  }

  const handleClearConversation = async () => {
    const ok = await deleteConversation()
    if (ok) {
      setConfirmClear(false)
      setHeaderMenuOpen(false)
      onConversationChanged?.()
    }
  }

  const canModerateMessage = (msg: OrderMessage) =>
    isAdmin && !isMessageDeleted(msg) && msg.sender_role === 'admin' && msg.sender_id === user?.id

  return (
    <div
      className={`flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] ${className}`}
    >
      <div className="relative flex shrink-0 items-center gap-2 border-b border-white/10 px-3 py-2.5">
        <MessageCircle className="h-4 w-4 text-brand-bright" />
        <h3 className="font-display text-sm font-semibold tracking-tight text-white">{title}</h3>
        <span className="text-caption ml-auto font-normal">
          {isAdmin ? 'Customer inbox' : 'Live · in-site chat'}
        </span>

        {isAdmin && (
          <div ref={headerMenuRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setHeaderMenuOpen((v) => !v)}
              className="rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Chat options"
              aria-expanded={headerMenuOpen}
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {headerMenuOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 min-w-[12rem] overflow-hidden rounded-xl border border-white/10 bg-midnight-900 py-1 shadow-xl">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeletedHistory((v) => !v)
                    setHeaderMenuOpen(false)
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-white/80 transition-colors hover:bg-white/5"
                >
                  <History className="h-4 w-4 shrink-0" />
                  {showDeletedHistory ? 'Hide deleted history' : 'Show deleted history'}
                  {deletedCount > 0 && !showDeletedHistory && (
                    <span className="ml-auto text-xs text-white/40">({deletedCount})</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmClear(true)
                    setHeaderMenuOpen(false)
                  }}
                  disabled={moderating || activeMessageCount === 0}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-red-300 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <MessageSquareX className="h-4 w-4 shrink-0" />
                  Delete conversation
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isAdmin && showDeletedHistory && deletedCount > 0 && (
        <div className="shrink-0 border-b border-amber-500/20 bg-amber-500/10 px-4 py-2">
          <p className="text-caption text-amber-200/90">
            Viewing full history — {deletedCount} deleted message
            {deletedCount !== 1 ? 's' : ''} (admin only).
          </p>
        </div>
      )}

      {confirmClear && (
        <div className="shrink-0 border-b border-red-500/20 bg-red-500/10 px-4 py-3">
          <p className="text-sm font-medium text-red-200">Delete entire conversation?</p>
          <p className="text-caption mt-1 text-red-200/70">
            Messages will be hidden from the customer but kept in your admin history. Use
            &quot;Show deleted history&quot; in ⋮ to review them later.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmClear(false)}
              className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleClearConversation()}
              disabled={moderating}
              className="rounded-lg bg-red-500/90 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-50"
            >
              {moderating ? 'Deleting…' : 'Delete all messages'}
            </button>
          </div>
        </div>
      )}

      <div className="min-h-0 flex-1 scroll-y px-3 py-3">
        {loading ? (
          <p className="text-subtle m-auto text-center">Loading messages…</p>
        ) : messages.length === 0 && deletedCount > 0 && isAdmin ? (
          <p className="text-body m-auto max-w-xs text-center">
            All messages were hidden from the customer. Open ⋮ → Show deleted history to review{' '}
            {deletedCount} past message{deletedCount !== 1 ? 's' : ''}.
          </p>
        ) : messages.length === 0 ? (
          <p className="text-body m-auto max-w-xs text-center">
            No messages yet. Say hello or ask about your order — we&apos;ll reply here.
          </p>
        ) : (
          <ul className="space-y-2">
            {messages.map((msg) => {
              const isOwnMessage = msg.sender_role === viewerRole
              const deleted = isMessageDeleted(msg)
              const showAdminActions = canModerateMessage(msg)
              const editing = editingId === msg.id

              return (
                <li
                  key={msg.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`group relative max-w-[64%] rounded-xl px-3 py-2 text-[13px] leading-snug ${
                      deleted
                        ? 'border border-dashed border-white/15 bg-white/[0.03] text-white/55'
                        : isOwnMessage
                          ? 'rounded-br-md bg-[#0084FF] text-white shadow-sm'
                          : 'rounded-bl-md bg-[#0A1628] text-white shadow-sm ring-1 ring-[#1e3a5f]/80'
                    } ${showAdminActions ? 'pr-8' : ''}`}
                  >
                    {showAdminActions && !editing && (
                      <div className="absolute right-1 top-1">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMessageMenu((id) => (id === msg.id ? null : msg.id))
                          }
                          className={`rounded-md p-1 transition-colors ${
                            isOwnMessage
                              ? 'text-white/70 hover:bg-white/15 hover:text-white'
                              : 'text-white/50 hover:bg-white/10 hover:text-white'
                          } ${activeMessageMenu === msg.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                          aria-label="Message options"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </button>

                        {activeMessageMenu === msg.id && (
                          <>
                            <button
                              type="button"
                              className="fixed inset-0 z-10 cursor-default"
                              aria-label="Close menu"
                              onClick={() => setActiveMessageMenu(null)}
                            />
                            <div className="absolute right-0 top-full z-20 mt-1 min-w-[9.5rem] overflow-hidden rounded-lg border border-white/10 bg-midnight-900 py-1 shadow-xl">
                              <button
                                type="button"
                                onClick={() => startEdit(msg)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-white/80 hover:bg-white/5"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit reply
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setConfirmUnsendId(msg.id)
                                  setActiveMessageMenu(null)
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-300 hover:bg-red-500/10"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Unsend
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    <p
                      className={`mb-1 text-[9px] font-bold ${
                        msg.sender_role === 'admin' && !isOwnMessage
                          ? 'normal-case tracking-normal text-amber-200/95'
                          : 'uppercase tracking-[0.1em]'
                      } ${
                        deleted
                          ? 'text-white/35'
                          : isOwnMessage
                            ? 'text-white/75'
                            : 'text-sky-300/90'
                      }`}
                    >
                      {messageSenderLabel(msg, viewerRole, isAdmin, customerHandle)}
                      {deleted && msg.deleted_at && (
                        <span className="ml-2 normal-case font-semibold tracking-normal text-red-300/90">
                          · Deleted{' '}
                          {new Date(msg.deleted_at).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </p>

                    {editing ? (
                      <div className="space-y-2">
                        <textarea
                          value={editDraft}
                          onChange={(e) => setEditDraft(e.target.value)}
                          rows={3}
                          maxLength={4000}
                          className="w-full resize-none rounded-lg border border-midnight-200 bg-white px-3 py-2 text-sm text-midnight-950 focus:outline-none focus:ring-1 focus:ring-brand/40"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-midnight-600 hover:bg-midnight-950/5"
                          >
                            <X className="h-3.5 w-3.5" />
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => void saveEdit()}
                            disabled={moderating || !editDraft.trim()}
                            className="inline-flex items-center gap-1 rounded-lg bg-midnight-950 px-2 py-1 text-xs font-semibold text-white disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p
                          className={`whitespace-pre-wrap break-words ${
                            deleted ? 'line-through decoration-white/25' : ''
                          }`}
                        >
                          {msg.body}
                        </p>
                        <p
                          className={`mt-1 text-[9px] font-medium ${
                            deleted
                              ? 'text-white/30'
                              : isOwnMessage
                                ? 'text-white/70'
                                : 'text-white/50'
                          }`}
                        >
                          {new Date(msg.created_at).toLocaleTimeString(undefined, {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                          {isEdited(msg) && (
                            <span className="ml-1.5 italic opacity-80">· edited</span>
                          )}
                        </p>
                      </>
                    )}
                  </div>
                </li>
              )
            })}
            <div ref={bottomRef} />
          </ul>
        )}
      </div>

      {confirmUnsendId && (
        <div className="shrink-0 border-t border-red-500/20 bg-red-500/10 px-4 py-3">
          <p className="text-sm text-red-200">
            Unsend this reply? It will be hidden from the customer but kept in admin history.
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmUnsendId(null)}
              className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/70"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleUnsend(confirmUnsendId)}
              disabled={moderating}
              className="rounded-lg bg-red-500/90 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
            >
              {moderating ? 'Removing…' : 'Unsend message'}
            </button>
          </div>
        </div>
      )}

      {error && <p className="shrink-0 px-4 pb-2 text-xs font-medium text-red-300">{error}</p>}

      <form onSubmit={handleSubmit} className="flex shrink-0 gap-2 border-t border-white/10 p-2.5">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={
            isAdmin ? 'Reply to customer…' : `Message ${shopContact.chatSenderShort} about your order…`
          }
          maxLength={4000}
          disabled={moderating}
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[13px] text-white placeholder:text-white/35 focus:border-brand/40 focus:outline-none focus:ring-1 focus:ring-brand/25 disabled:opacity-50"
        />
        <GradientButton type="submit" size="sm" disabled={sending || moderating || !draft.trim()}>
          <Send className="h-4 w-4" />
        </GradientButton>
      </form>
    </div>
  )
}
