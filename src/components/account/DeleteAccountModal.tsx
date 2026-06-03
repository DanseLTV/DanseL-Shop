import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Trash2, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { normalizeUsername } from '../../utils/authHelpers'
import { GradientButton } from '../ui/GradientButton'

interface DeleteAccountModalProps {
  open: boolean
  username: string
  onClose: () => void
}

export function DeleteAccountModal({ open, username, onClose }: DeleteAccountModalProps) {
  const [confirmUsername, setConfirmUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { deleteAccount } = useAuth()
  const navigate = useNavigate()

  const normalizedExpected = normalizeUsername(username)
  const normalizedInput = normalizeUsername(confirmUsername)
  const canDelete =
    normalizedExpected.length > 0 &&
    normalizedInput === normalizedExpected

  const handleClose = () => {
    if (loading) return
    setConfirmUsername('')
    setError('')
    onClose()
  }

  const handleDelete = async () => {
    if (!canDelete || loading) return

    setError('')
    setLoading(true)
    const { error: deleteError } = await deleteAccount(confirmUsername)
    setLoading(false)

    if (deleteError) {
      setError(deleteError)
      return
    }

    setConfirmUsername('')
    onClose()
    navigate('/', { replace: true })
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={handleClose}
            aria-label="Close"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card relative w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white/70 transition-colors hover:bg-white/20 hover:text-white disabled:opacity-50"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="border-b border-red-500/20 bg-red-500/10 px-6 pb-5 pt-6">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20">
                <AlertTriangle className="h-6 w-6 text-red-300" />
              </div>
              <h2
                id="delete-account-title"
                className="font-display text-xl font-semibold text-white"
              >
                Delete account
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                This permanently removes your account, profile, and order history. This cannot be
                undone.
              </p>
            </div>

            <div className="space-y-4 p-6">
              <p className="text-sm text-white/70">
                To confirm, type your username:{' '}
                <span className="font-semibold text-white">@{username}</span>
              </p>

              <input
                type="text"
                value={confirmUsername}
                onChange={(e) => setConfirmUsername(e.target.value)}
                placeholder="Enter your username"
                autoComplete="off"
                disabled={loading}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-red-400/50 focus:outline-none disabled:opacity-60"
              />

              {error && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </p>
              )}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <GradientButton
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </GradientButton>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={!canDelete || loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-500/20 px-6 py-3 text-base font-semibold text-red-200 transition-colors hover:bg-red-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  {loading ? 'Deleting…' : 'Delete my account'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
