import { RoyalPageBackground } from '../ui/RoyalPageBackground'

/** Animated gold backdrop + theme tokens for all customer-facing pages. */
export function RoyalCustomerShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="royal-theme relative flex min-h-full flex-1 flex-col bg-[#030302]">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <RoyalPageBackground />
      </div>
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
    </div>
  )
}
