import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface BackNavLinkProps {
  to: string
  /** Screen reader label (e.g. "Back to shop") */
  label: string
  className?: string
}

export function BackNavLink({ to, label, className = '' }: BackNavLinkProps) {
  return (
    <Link
      to={to}
      aria-label={label}
      className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 text-sm font-medium tracking-tight text-white/90 transition-colors hover:border-brand/50 hover:bg-white/20 ${className}`}
    >
      <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2.5} />
      Back
    </Link>
  )
}
