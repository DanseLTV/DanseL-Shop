import { useState } from 'react'
import { ExternalLink, FileImage } from 'lucide-react'

interface PaymentProofViewerProps {
  proofUrl: string | null | undefined
  label?: string
  className?: string
}

/** Portrait phone-screenshot thumbnail + link — not a full-width banner. */
export function PaymentProofViewer({
  proofUrl,
  label = 'Payment proof',
  className = '',
}: PaymentProofViewerProps) {
  const [imgError, setImgError] = useState(false)

  if (!proofUrl) {
    return (
      <div
        className={`flex items-center gap-3 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-3 py-2.5 ${className}`}
      >
        <div className="flex h-20 w-14 shrink-0 items-center justify-center rounded-lg bg-white/5">
          <FileImage className="h-5 w-5 text-white/25" />
        </div>
        <p className="text-xs text-white/40">No payment proof uploaded</p>
      </div>
    )
  }

  const isPdf = proofUrl.toLowerCase().includes('.pdf')

  const thumbBox =
    'flex h-24 w-[4.25rem] shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-black/40 sm:h-28 sm:w-[4.75rem]'

  return (
    <div
      className={`flex items-stretch gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-2.5 sm:p-3 ${className}`}
    >
      {isPdf ? (
        <a
          href={proofUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={thumbBox}
          title="Open PDF payment proof"
          aria-label="Open PDF payment proof"
        >
          <FileImage className="h-6 w-6 text-accent-violet" />
        </a>
      ) : imgError ? (
        <a
          href={proofUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={thumbBox}
          title="Open payment proof"
          aria-label="Open payment proof"
        >
          <FileImage className="h-6 w-6 text-white/40" />
        </a>
      ) : (
        <a
          href={proofUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={thumbBox}
          title="Open payment proof"
          aria-label="Open payment proof"
        >
          <img
            src={proofUrl}
            alt=""
            onError={() => setImgError(true)}
            className="h-full w-full object-cover object-top"
          />
        </a>
      )}

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
          {label}
        </p>
        <p className="text-xs leading-snug text-white/55">
          {isPdf ? 'PDF receipt' : 'Screenshot preview'}
        </p>
        <a
          href={proofUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex w-fit items-center gap-1 text-xs font-medium text-accent-violet hover:text-accent-cyan"
        >
          Open full size
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  )
}
