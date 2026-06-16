import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { LandingFeatureRailHeader } from './LandingFeatureRail'

interface LandingNavProps {
  onLeave: () => void
}

export function LandingNav({ onLeave }: LandingNavProps) {
  return (
    <header className="absolute left-0 right-0 top-0 z-30 px-4 py-3 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-[90rem] items-center gap-2 sm:gap-3">
        <Link
          to="/shop"
          replace
          onClick={onLeave}
          className="flex shrink-0 items-center gap-2 sm:gap-2.5"
        >
          <img
            src="/shop-logo.png"
            alt=""
            className="h-8 w-8 rounded-lg object-cover ring-1 ring-amber-200/25 sm:h-9 sm:w-9"
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).style.display = 'none'
            }}
          />
          <span className="font-display text-xs font-bold tracking-[0.16em] text-amber-100/95 sm:text-sm lg:text-base">
            DANSEL <span className="text-royal-gold">SHOP</span>
          </span>
        </Link>

        <LandingFeatureRailHeader />

        <Link
          to="/shop"
          replace
          onClick={onLeave}
          className="btn-royal-outline inline-flex shrink-0 items-center gap-1.5 !rounded-full !px-3 !py-1.5 text-[10px] font-semibold uppercase tracking-wider sm:gap-2 sm:!px-4 sm:!py-2 sm:text-xs lg:!px-5 lg:text-[11px]"
        >
          <ShoppingBag className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span className="hidden sm:inline">Enter Shop</span>
          <span className="sm:hidden">Shop</span>
        </Link>
      </div>
    </header>
  )
}
