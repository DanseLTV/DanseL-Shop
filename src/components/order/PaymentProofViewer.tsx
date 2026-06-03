import { useState } from 'react'
import { ExternalLink, FileImage } from 'lucide-react'

interface PaymentProofViewerProps {
  proofUrl: string | null | undefined
  label?: string
}

export function PaymentProofViewer({ proofUrl, label = 'Payment proof' }: PaymentProofViewerProps) {
  const [imgError, setImgError] = useState(false)

  if (!proofUrl) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-6 text-center">
        <FileImage className="mx-auto h-8 w-8 text-white/25" />
        <p className="mt-2 text-sm text-white/40">No payment proof uploaded</p>
      </div>
    )
  }

  const isPdf = proofUrl.toLowerCase().includes('.pdf')

  const linkClass =
    'flex items-center justify-center gap-2 rounded-lg bg-white/5 py-3 text-xs text-accent-violet hover:bg-white/10'

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5 sm:p-3">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-white/50">{label}</p>
        <a
          href={proofUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-accent-violet hover:text-accent-cyan"
        >
          Open full size
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      {isPdf ? (
        <a href={proofUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
          <FileImage className="h-4 w-4" />
          View PDF proof
        </a>
      ) : imgError ? (
        <a href={proofUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
          <FileImage className="h-4 w-4" />
          Preview unavailable — open in new tab
        </a>
      ) : (
        <a
          href={proofUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block overflow-hidden rounded-lg bg-black/20"
        >
          <img
            src={proofUrl}
            alt="Payment proof thumbnail"
            onError={() => setImgError(true)}
            className="mx-auto max-h-28 w-full object-contain sm:max-h-32"
          />
        </a>
      )}
    </div>
  )
}
