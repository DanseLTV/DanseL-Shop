import type { ReactNode } from 'react'
import { GradientButton } from './GradientButton'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  actionTo?: string
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionTo,
}: EmptyStateProps) {
  return (
    <div className="glass-card flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/50">
        {icon}
      </div>
      <p className="font-display text-xl font-semibold tracking-tight text-white">{title}</p>
      {description && (
        <p className="text-body mt-3 max-w-sm">{description}</p>
      )}
      {actionLabel && (onAction || actionTo) && (
        <div className="mt-6">
          {actionTo ? (
            <GradientButton to={actionTo}>{actionLabel}</GradientButton>
          ) : (
            <GradientButton onClick={onAction}>{actionLabel}</GradientButton>
          )}
        </div>
      )}
    </div>
  )
}
