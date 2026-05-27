import { Wallet, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import type { PaymentMethod } from '../../types'
import { getPaymentDetails, shopPayments } from '../../data/shopPayments'
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
    if (!text) return
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

      {details.qrImage && (
        <div className="mb-4 flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white p-4">
          <img
            src={details.qrImage}
            alt={`${details.title} QR Code`}
            className="h-56 w-56 rounded-lg object-contain"
          />
          {details.qrCaption && (
            <p className="text-center text-xs font-medium text-midnight-900">
              {details.qrCaption}
            </p>
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

      <p className="mt-4 text-xs text-white/40">
        After paying, upload your payment proof below. Admin will reply on the in-site chat once your order is submitted.
      </p>
    </div>
  )
}
