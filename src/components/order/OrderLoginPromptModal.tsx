import { motion, AnimatePresence } from 'framer-motion'
import { X, LogIn, UserPlus, ShoppingBag, ListOrdered } from 'lucide-react'
import { orderSteps } from '../../data/site'
import type { PendingOrder } from '../../context/OrderFlowContext'
import { formatPrice } from '../../data/products'
import { GradientButton } from '../ui/GradientButton'

interface OrderLoginPromptModalProps {
  open: boolean
  pending: PendingOrder | null
  onCancel: () => void
  onLogin: () => void
  onSignup: () => void
}

export function OrderLoginPromptModal({
  open,
  pending,
  onCancel,
  onLogin,
  onSignup,
}: OrderLoginPromptModalProps) {
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
          aria-labelledby="order-login-title"
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
            className="glass-card relative w-full max-w-lg overflow-hidden"
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

            <div className="border-b border-white/10 bg-gradient-to-br from-accent-violet/20 to-accent-cyan/10 px-6 pb-5 pt-6">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent-violet to-accent-cyan shadow-glow">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <h2
                id="order-login-title"
                className="font-display text-2xl font-bold text-white"
              >
                Sign in to place your order
              </h2>
              <p className="mt-2 text-sm text-white/60">
                You can browse freely — we only need an account when you&apos;re ready to
                checkout.
              </p>

              {pending?.productName && (
                <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-accent-violet">
                    Selected product
                  </p>
                  <p className="mt-1 font-display text-lg font-semibold text-white">
                    {pending.productName}
                  </p>
                  {pending.productPrice != null && (
                    <p className="text-sm text-white/50">
                      {formatPrice(pending.productPrice)}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <ListOrdered className="h-4 w-4 text-accent-cyan" />
                How ordering works
              </div>
              <ol className="space-y-3">
                {orderSteps.map((step) => (
                  <li
                    key={step.step}
                    className="flex gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-violet/20 font-display text-xs font-bold text-accent-violet">
                      {step.step}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white">{step.title}</p>
                      <p className="text-xs leading-relaxed text-white/50">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onCancel}
                  className="order-2 flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 transition-colors hover:border-white/25 hover:bg-white/10 sm:order-1"
                >
                  Cancel
                </button>
                <GradientButton
                  type="button"
                  onClick={onLogin}
                  className="order-1 flex-1 sm:order-2"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In to Order
                </GradientButton>
              </div>

              <p className="mt-4 text-center text-sm text-white/50">
                No account yet?{' '}
                <button
                  type="button"
                  onClick={onSignup}
                  className="inline-flex items-center gap-1 font-medium text-accent-violet hover:text-accent-cyan"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Create account
                </button>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
