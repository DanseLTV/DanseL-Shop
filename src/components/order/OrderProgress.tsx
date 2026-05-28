import { orderPipelineSteps, orderStatusMeta, statusIndex, type OrderStatus } from '../../data/orderStatus'

interface OrderProgressProps {
  status: OrderStatus
  compact?: boolean
}

export function OrderProgress({ status, compact = false }: OrderProgressProps) {
  if (status === 'cancelled') {
    return (
      <p className="text-sm text-red-300/90">{orderStatusMeta.cancelled.description}</p>
    )
  }

  const current = statusIndex(status)

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      <div className="flex items-center gap-1">
        {orderPipelineSteps.map((step, i) => {
          const done = i <= current
          const active = i === current
          return (
            <div key={step.status} className="flex flex-1 items-center gap-1">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  done
                    ? active
                      ? 'bg-accent-violet text-white shadow-glow'
                      : 'bg-emerald-500/30 text-emerald-300'
                    : 'bg-white/10 text-white/40'
                }`}
              >
                {i + 1}
              </div>
              {i < orderPipelineSteps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 rounded ${
                    i < current ? 'bg-emerald-500/50' : 'bg-white/10'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
      {!compact && (
        <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-white/50 sm:text-xs">
          {orderPipelineSteps.map((step) => (
            <span key={step.status}>{step.title}</span>
          ))}
        </div>
      )}
      <p className="text-xs text-white/50">{orderStatusMeta[status].description}</p>
    </div>
  )
}
