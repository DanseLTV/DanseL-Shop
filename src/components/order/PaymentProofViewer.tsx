import { ExternalLink, FileImage } from 'lucide-react'

interface PaymentProofViewerProps {
  proofUrl: string | null | undefined
  label?: string
}

export function PaymentProofViewer({ proofUrl, label = 'Payment proof' }: PaymentProofViewerProps) {
  if (!proofUrl) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-6 text-center">
        <FileImage className="mx-auto h-8 w-8 text-white/25" />
        <p className="mt-2 text-sm text-white/40">No payment proof uploaded</p>
      </div>
    )
  }

  const isPdf = proofUrl.toLowerCase().includes('.pdf')

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-white/50">{label}</p>
        <a
          href={proofUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-accent-violet hover:text-accent-cyan"
        >
          Open full size
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      {isPdf ? (
        <a
          href={proofUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-lg bg-white/5 py-8 text-sm text-accent-violet hover:bg-white/10"
        >
          <FileImage className="h-5 w-5" />
          View PDF proof
        </a>
      ) : (
        <a href={proofUrl} target="_blank" rel="noopener noreferrer" className="block">
          <img
            src={proofUrl}
            alt="Payment proof"
            className="max-h-64 w-full rounded-lg object-contain bg-black/20"
          />
        </a>
      )}
    </div>
  )
}
