interface AuthPageShellProps {
  children: React.ReactNode
  /** Tighter layout for multi-field forms (signup) */
  compact?: boolean
}

/** Full viewport auth layout — fits below navbar without page scroll. */
export function AuthPageShell({ children, compact = false }: AuthPageShellProps) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        className={`relative mx-auto flex w-full min-h-0 flex-1 flex-col justify-center overflow-hidden px-4 sm:px-6 ${
          compact ? 'max-w-xl py-1 sm:max-w-2xl sm:py-2' : 'max-w-md py-3 sm:py-4'
        }`}
      >
        <div className="w-full">{children}</div>
      </div>
    </div>
  )
}
