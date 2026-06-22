import { Fragment } from 'react'
import { Check } from 'lucide-react'
import { orderPipelineSteps, orderStatusMeta, statusIndex, type OrderStatus } from '../../data/orderStatus'

interface OrderProgressProps {
  status: OrderStatus
  compact?: boolean
  showDescription?: boolean
  /** Shorter step labels — better in narrow admin panels */
  dense?: boolean
}

export function OrderProgress({
  status,
  compact = false,
  showDescription = true,
  dense = false,
}: OrderProgressProps) {
  if (status === 'cancelled') {
    return (
      <div className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2.5">
        <p className="text-xs font-semibold text-red-200">Order cancelled</p>
        <p className="mt-1 text-xs leading-relaxed text-red-200/75">
          {orderStatusMeta.cancelled.description}
        </p>
      </div>
    )
  }

  const current = statusIndex(status)

  return (
    <div className={compact ? 'space-y-2' : 'space-y-2.5'}>
      <div className="flex w-full items-start">
        {orderPipelineSteps.map((step, i) => {
          const done = i <= current
          const active = i === current
          const completed = done && !active
          const label = compact ? null : dense ? step.shortTitle : step.title

          return (
            <Fragment key={step.status}>
              {i > 0 && (
                <div
                  className={`mt-3.5 h-0.5 min-w-2 flex-1 rounded ${
                    i <= current ? 'bg-emerald-500/55' : 'bg-white/10'
                  }`}
                  aria-hidden
                />
              )}

              <div className="flex w-14 shrink-0 flex-col items-center sm:w-16">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    active
                      ? 'bg-amber-400 text-[#1a1008] shadow-[0_0_14px_rgba(255,196,90,0.35)]'
                      : completed
                        ? 'bg-emerald-500/35 text-emerald-200'
                        : 'bg-white/10 text-white/40'
                  }`}
                >
                  {completed ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : i + 1}
                </span>

                {label && (
                  <span
                    className={`mt-1.5 text-center text-[10px] leading-tight ${
                      active
                        ? 'font-semibold text-amber-200/95'
                        : completed
                          ? 'text-emerald-300/85'
                          : 'text-white/45'
                    }`}
                  >
                    {label}
                  </span>
                )}
              </div>
            </Fragment>
          )
        })}
      </div>

      {!compact && !dense && showDescription && (
        <p className="text-xs leading-relaxed text-white/50">{orderStatusMeta[status].description}</p>
      )}
    </div>
  )
}
