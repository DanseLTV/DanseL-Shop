import { Link } from 'react-router-dom'
import { ChevronRight, type LucideIcon } from 'lucide-react'

interface AccountNavRowProps {
  to?: string
  onClick?: () => void
  icon: LucideIcon
  title: string
  subtitle?: string
  iconClassName?: string
}

export function AccountNavRow({
  to,
  onClick,
  icon: Icon,
  title,
  subtitle,
  iconClassName = 'text-accent-cyan',
}: AccountNavRowProps) {
  const className =
    'flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-left transition-colors hover:border-accent-violet/30 hover:bg-white/[0.06]'

  const content = (
    <>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
        <Icon className={`h-5 w-5 ${iconClassName}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white">{title}</p>
        {subtitle && <p className="mt-0.5 text-xs text-white/45">{subtitle}</p>}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-white/30" aria-hidden />
    </>
  )

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  )
}
