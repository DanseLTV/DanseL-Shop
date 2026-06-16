import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import type { FAQItem } from '../../types'

interface FAQAccordionProps {
  items: FAQItem[]
  limit?: number
}

export function FAQAccordion({ items, limit }: FAQAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null)
  const displayItems = limit ? items.slice(0, limit) : items

  return (
    <div className="space-y-3">
      {displayItems.map((item) => {
        const isOpen = openId === item.id
        return (
          <div key={item.id} className="glass-card overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-white/[0.02]"
            >
              <span className="font-medium text-white">{item.question}</span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="shrink-0 text-brand"
              >
                <ChevronDown className="h-5 w-5" />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="border-t border-white/10 px-5 pb-5 pt-3">
                    <p className="text-sm leading-relaxed text-white/60">
                      {item.answer}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
