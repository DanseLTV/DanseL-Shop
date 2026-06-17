import { BadgeCheck, Zap, RefreshCw } from 'lucide-react'

const features = [
  { icon: BadgeCheck, label: 'Verified', sub: 'Accounts' },
  { icon: Zap, label: 'Fast', sub: 'Delivery' },
  { icon: RefreshCw, label: 'Replacement', sub: 'Guarantee' },
]

/** Compact feature pills aligned in the landing header row (logo · features · enter shop). */
export function LandingFeatureRailHeader() {
  return (
    <div className="flex min-w-0 items-center justify-center gap-1 sm:gap-1.5 lg:gap-1.5">
      {features.map((item) => (
        <div
          key={item.label}
          className="flex h-8 shrink-0 items-center gap-1 rounded-lg border border-amber-200/15 bg-black/35 px-1.5 backdrop-blur-md sm:gap-1.5 sm:px-2 lg:h-9 lg:px-2.5"
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-amber-200/20 bg-amber-100/[0.04] lg:h-6 lg:w-6">
            <item.icon className="h-2.5 w-2.5 text-amber-200/90 sm:h-3 sm:w-3" strokeWidth={1.5} />
          </span>
          <div className="hidden min-w-0 text-left sm:block">
            <p className="text-[6.5px] font-bold uppercase leading-none tracking-[0.14em] text-amber-200/75 sm:text-[7px] lg:text-[8px]">
              {item.label}
            </p>
            <p className="mt-0.5 text-[5.5px] uppercase leading-none tracking-[0.1em] text-amber-100/35 sm:text-[6.5px] lg:text-[7px]">
              {item.sub}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
