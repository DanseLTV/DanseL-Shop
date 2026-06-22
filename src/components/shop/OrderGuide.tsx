import { useState } from 'react'
import { ChevronDown, ListOrdered } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { orderSteps } from '../../data/site'

export function OrderGuide() {
  const [open, setOpen] = useState(true)

  return (
    <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.04]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 font-display text-sm font-semibold tracking-tight text-white">
          <ListOrdered className="h-4 w-4 text-amber-200" />
          How to order — quick guide
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-white/50 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="grid gap-3 border-t border-white/10 px-5 pb-5 pt-2 sm:grid-cols-2 lg:grid-cols-4">
              {orderSteps.map((step) => (
                <div
                  key={step.step}
                  className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <span className="font-display text-xl font-bold text-royal-gold">
                    {step.step}
                  </span>
                  <p className="mt-2 text-sm font-semibold tracking-tight text-white">{step.title}</p>
                  <p className="text-caption mt-1.5 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
