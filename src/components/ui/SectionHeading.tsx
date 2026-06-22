interface SectionHeadingProps {
  badge?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  compact?: boolean
}

export function SectionHeading({
  badge,
  title,
  subtitle,
  align = 'center',
  compact = false,
}: SectionHeadingProps) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left'

  return (
    <div
      className={`${compact ? 'mb-4 max-w-3xl lg:mb-5' : 'mb-12 max-w-2xl lg:mb-16'} ${alignClass}`}
    >
      {badge && (
        <span
          className={`text-eyebrow inline-flex rounded-full border border-amber-200/25 bg-amber-400/10 ${
            compact ? 'mb-2 px-3 py-1 text-[10px] tracking-[0.16em]' : 'mb-4 px-4 py-1.5'
          }`}
        >
          {badge}
        </span>
      )}
      <h2 className={compact ? 'text-display-sm' : 'text-display-md'}>{title}</h2>
      {subtitle && (
        <p className={`${compact ? 'text-body mt-2 max-w-2xl' : 'text-lead mt-4 max-w-xl'}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
