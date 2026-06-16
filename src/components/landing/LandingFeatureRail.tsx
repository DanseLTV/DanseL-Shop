import { BadgeCheck, Zap, RefreshCw } from 'lucide-react'

const features = [
  { icon: BadgeCheck, label: 'Verified', sub: 'Accounts' },
  { icon: Zap, label: 'Fast', sub: 'Delivery' },
  { icon: RefreshCw, label: 'Replacement', sub: 'Guarantee' },
]

/** Compact feature pills aligned in the landing header row (logo · features · enter shop). */
export function LandingFeatureRailHeader() {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-center gap-1 sm:gap-1.5 lg:gap-2">
      {features.map((item) => (
        <div
          key={item.label}
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-amber-200/15 bg-black/35 px-2 backdrop-blur-md sm:gap-2 sm:px-2.5 lg:h-10 lg:px-3"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-amber-200/20 bg-amber-100/[0.04] lg:h-7 lg:w-7">
            <item.icon className="h-3 w-3 text-amber-200/90 lg:h-3.5 lg:w-3.5" strokeWidth={1.5} />
          </span>
          <div className="hidden min-w-0 text-left sm:block">
            <p className="text-[7px] font-bold uppercase leading-none tracking-[0.14em] text-amber-200/75 sm:text-[8px] lg:text-[9px]">
              {item.label}
            </p>
            <p className="mt-0.5 text-[6px] uppercase leading-none tracking-[0.1em] text-amber-100/35 sm:text-[7px] lg:text-[8px]">
              {item.sub}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
