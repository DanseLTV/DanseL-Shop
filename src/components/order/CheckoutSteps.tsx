import { Package, CreditCard, Upload } from 'lucide-react'

const steps = [
  { id: 1, label: 'Product', icon: Package },
  { id: 2, label: 'Payment', icon: CreditCard },
  { id: 3, label: 'Proof', icon: Upload },
] as const

export function CheckoutSteps({ activeStep = 1 }: { activeStep?: 1 | 2 | 3 }) {
  return (
    <ol className="mb-8 flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 sm:px-6">
      {steps.map((step, i) => {
        const done = step.id < activeStep
        const active = step.id === activeStep
        const Icon = step.icon
        return (
          <li
            key={step.id}
            className={`flex flex-1 items-center gap-2 text-xs font-medium sm:text-sm ${
              active ? 'text-white' : done ? 'text-brand' : 'text-white/40'
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                active
                  ? 'border-white/30 bg-white/10'
                  : done
                    ? 'border-brand/40 bg-brand/10'
                    : 'border-white/10 bg-white/5'
              }`}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="hidden sm:inline">{step.label}</span>
            {i < steps.length - 1 && (
              <span
                className="ml-auto hidden h-px flex-1 bg-white/10 sm:block"
                aria-hidden
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
