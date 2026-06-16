interface SectionHeadingProps {
  badge?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
}

export function SectionHeading({
  badge,
  title,
  subtitle,
  align = 'center',
}: SectionHeadingProps) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left'

  return (
    <div className={`mb-12 max-w-2xl lg:mb-16 ${alignClass}`}>
      {badge && (
        <span className="text-eyebrow mb-4 inline-flex rounded-full border border-brand/25 bg-brand/10 px-4 py-1.5">
          {badge}
        </span>
      )}
      <h2 className="text-display-md">{title}</h2>
      {subtitle && <p className="text-lead mt-4 max-w-xl">{subtitle}</p>}
    </div>
  )
}
