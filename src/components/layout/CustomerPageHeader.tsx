import type { ReactNode } from 'react'
import { BackNavLink } from '../ui/BackNavLink'

interface CustomerPageHeaderProps {
  badge?: string
  title: ReactNode
  subtitle?: string
  backTo?: string
  backLabel?: string
  align?: 'left' | 'center'
  actions?: ReactNode
  className?: string
}

export function CustomerPageHeader({
  badge,
  title,
  subtitle,
  backTo,
  backLabel = 'Back',
  align = 'left',
  actions,
  className = '',
}: CustomerPageHeaderProps) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left'

  return (
    <header className={`pb-6 pt-4 ${className}`}>
      {backTo && <BackNavLink to={backTo} label={backLabel} className="mb-5" />}
      <div
        className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${align === 'center' ? 'sm:flex-col sm:items-center' : ''}`}
      >
        <div className={`${align === 'center' ? 'mx-auto max-w-5xl text-center' : 'max-w-2xl'} ${alignClass}`}>
          {badge && <p className="text-eyebrow mb-3">{badge}</p>}
          <h1 className={align === 'center' ? 'text-display-sm sm:text-display-md' : 'text-display-md'}>
            {title}
          </h1>
          {subtitle && (
            <p className={`text-lead mt-3 ${align === 'center' ? 'mx-auto max-w-2xl' : 'max-w-xl'}`}>
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
    </header>
  )
}
