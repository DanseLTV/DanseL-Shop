import { Wallet, Copy, Check, Send } from 'lucide-react'
import { useState } from 'react'
import type { PaymentMethod } from '../../types'
import { getPaymentDetails, shopPayments } from '../../data/shopPayments'
import { shopContact } from '../../data/shopContact'
import { formatPrice } from '../../data/products'

interface PaymentInstructionsProps {
  method: PaymentMethod
  amount?: number
  productName?: string
}

export function PaymentInstructions({
  method,
  amount,
  productName,
}: PaymentInstructionsProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const details = getPaymentDetails(method)

  const copyText = async (text: string, key: string) => {
    if (!text || text.includes('Message')) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      /* clipboard unavailable */
    }
  }

  const gcashNumber = shopPayments.gcash.number
  const mayaNumber = shopPayments.maya.number

  return (
    <div className="rounded-xl border border-accent-violet/25 bg-accent-violet/5 p-5">
      <div className="mb-3 flex items-center gap-2">
        <Wallet className="h-5 w-5 text-accent-violet" />
        <h4 className="font-display font-semibold text-white">
          {details.title} Payment Details
        </h4>
      </div>

      {amount !== undefined && (
        <div className="mb-4 rounded-lg border border-white/10 bg-midnight-950/50 px-4 py-3">
          <p className="text-xs text-white/40">Amount to pay (exact)</p>
          <p className="font-display text-2xl font-bold text-accent-cyan">
            {formatPrice(amount)}
          </p>
          {productName && (
            <p className="mt-1 text-sm text-white/50">For: {productName}</p>
          )}
        </div>
      )}

      <ul className="space-y-2 text-sm text-white/70">
        {details.lines.map((line) => (
          <li key={line} className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-violet" />
            {line}
          </li>
        ))}
      </ul>

      {method === 'GCash' && gcashNumber && (
        <button
          type="button"
          onClick={() => copyText(gcashNumber, 'gcash')}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 py-2.5 text-sm font-medium text-white/80 transition-colors hover:border-accent-violet/40"
        >
          {copied === 'gcash' ? (
            <>
              <Check className="h-4 w-4 text-emerald-400" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy GCash number
            </>
          )}
        </button>
      )}

      {method === 'Maya' && mayaNumber && (
        <button
          type="button"
          onClick={() => copyText(mayaNumber, 'maya')}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 py-2.5 text-sm font-medium text-white/80 transition-colors hover:border-accent-violet/40"
        >
          {copied === 'maya' ? (
            <>
              <Check className="h-4 w-4 text-emerald-400" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy Maya number
            </>
          )}
        </button>
      )}

      <a
        href={shopContact.telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-accent-violet/20 to-accent-cyan/20 py-2.5 text-sm font-medium text-accent-cyan transition-colors hover:text-white"
      >
        <Send className="h-4 w-4" />
        Confirm on Telegram {shopContact.telegramUsername}
      </a>

      <p className="mt-3 text-xs text-white/40">{shopPayments.telegramConfirmNote}</p>
    </div>
  )
}
