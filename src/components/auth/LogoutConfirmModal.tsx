import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, X } from 'lucide-react'

type LogoutConfirmPlacement = 'navbar' | 'center'

interface LogoutConfirmModalProps {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
  /** Near top-right logout (navbar). Use `center` on account / admin pages. */
  placement?: LogoutConfirmPlacement
}

export function LogoutConfirmModal({
  open,
  onCancel,
  onConfirm,
  placement = 'navbar',
}: LogoutConfirmModalProps) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const panel = (
    <motion.div
      initial={{ opacity: 0, y: placement === 'navbar' ? -10 : 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: placement === 'navbar' ? -10 : 16, scale: 0.96 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={
        placement === 'navbar'
          ? 'glass-card fixed right-4 top-[4.25rem] z-[201] w-[min(calc(100vw-2rem),22rem)] overflow-hidden p-5 shadow-2xl sm:right-6 sm:top-[4.5rem] sm:p-6 lg:right-8'
          : 'glass-card relative z-[201] w-full max-w-sm overflow-hidden p-6'
      }
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={onCancel}
        className="absolute right-3 top-3 rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/10">
        <LogOut className="h-6 w-6 text-amber-300" />
      </div>

      <h2 id="logout-confirm-title" className="font-display text-lg font-semibold text-white">
        Log out?
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-white/60">
        Are you sure you want to log out? You will need to sign in again to access your account and
        orders.
      </p>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          No, stay signed in
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-xl bg-red-500/90 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-500"
        >
          Yes, log out
        </button>
      </div>
    </motion.div>
  )

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={
            placement === 'navbar'
              ? 'fixed inset-0 z-[200]'
              : 'fixed inset-0 z-[200] flex items-center justify-center p-4'
          }
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-confirm-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={onCancel}
            aria-label="Close"
          />
          {panel}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
