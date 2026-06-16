import { useEffect } from 'react'
import { X, CheckCircle, AlertCircle } from 'lucide-react'

interface ToastBannerProps {
  message: string
  variant: 'success' | 'error'
  onDismiss: () => void
}

export function ToastBanner({ message, variant, onDismiss }: ToastBannerProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4500)
    return () => clearTimeout(t)
  }, [message, onDismiss])

  return (
    <div
      role="status"
      className={`fixed right-4 top-4 z-[60] flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-glass backdrop-blur-xl sm:top-5 sm:right-5 ${
        variant === 'success'
          ? 'border-emerald-500/40 bg-emerald-950/95'
          : 'border-status-error/30 bg-midnight-900/95'
      }`}
    >
      {variant === 'success' ? (
        <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400" />
      ) : (
        <AlertCircle className="h-5 w-5 shrink-0 text-status-error" />
      )}
      <p
        className={`flex-1 text-sm font-medium ${
          variant === 'success' ? 'text-emerald-300' : 'text-white/90'
        }`}
      >
        {message}
      </p>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded p-0.5 text-white/50 hover:text-white"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
