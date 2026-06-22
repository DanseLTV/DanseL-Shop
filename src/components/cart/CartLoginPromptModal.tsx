import { motion, AnimatePresence } from 'framer-motion'
import { X, LogIn, ShoppingCart, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'

interface CartLoginPromptModalProps {
  open: boolean
  onCancel: () => void
  onLogin: () => void
}

export function CartLoginPromptModal({
  open,
  onCancel,
  onLogin,
}: CartLoginPromptModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="royal-theme fixed inset-0 z-[110] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-login-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={onCancel}
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
              onClick={onCancel}
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="border-b border-amber-200/10 bg-gradient-to-br from-amber-400/15 to-amber-600/5 px-6 pb-5 pt-6">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-amber-200/30 bg-amber-400/15">
                <ShoppingCart className="h-6 w-6 text-amber-200" />
              </div>
              <h2 id="cart-login-title" className="font-display text-xl font-bold text-white sm:text-2xl">
                Sign in to add to cart
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                Sign in first, then tap Add to Cart again on the product you want.
              </p>
            </div>

            <div className="px-6 py-5">
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onCancel}
                  className="order-2 flex-1 rounded-full border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 transition-colors hover:border-white/25 hover:bg-white/10 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onLogin}
                  className="btn-royal-gold order-1 flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm sm:order-2"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </button>
              </div>

              <p className="mt-4 text-center text-sm text-white/50">
                No account yet?{' '}
                <Link
                  to="/signup?redirect=%2Fshop"
                  onClick={onCancel}
                  className="inline-flex items-center gap-1 font-medium text-amber-200 hover:text-amber-100"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Sign Up
                </Link>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
