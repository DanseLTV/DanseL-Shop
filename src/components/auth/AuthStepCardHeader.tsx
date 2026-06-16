import { ArrowLeft } from 'lucide-react'

interface AuthStepCardHeaderProps {
  backLabel: string
  onBack: () => void
  disabled?: boolean
  stepLabel: string
}

export function AuthStepCardHeader({
  backLabel,
  onBack,
  disabled = false,
  stepLabel,
}: AuthStepCardHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2 sm:px-5 sm:py-2.5">
      <button
        type="button"
        onClick={onBack}
        disabled={disabled}
        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 text-sm font-medium text-white/90 transition-colors hover:border-accent-violet/50 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={backLabel}
      >
        <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2.5} />
        Back
      </button>

      <span className="text-xs font-semibold uppercase tracking-wider text-white/45">
        {stepLabel}
      </span>
    </div>
  )
}
