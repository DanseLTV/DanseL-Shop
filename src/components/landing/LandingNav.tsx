import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LandingFeatureRailHeader } from './LandingFeatureRail'
import { BrandName } from '../ui/BrandName'

interface LandingNavProps {
  onLeave: () => void
}

const authBtnBase =
  'inline-flex shrink-0 items-center justify-center !rounded-full !px-3 !py-1.5 text-[10px] font-semibold uppercase tracking-wider sm:!px-4 sm:!py-2 sm:text-xs'

function stopBubble(e: React.MouseEvent | React.PointerEvent) {
  e.stopPropagation()
}

export function LandingNav({ onLeave }: LandingNavProps) {
  const { user, loading } = useAuth()

  return (
    <header
      className="absolute left-0 right-0 top-0 z-50 px-4 py-3 sm:px-6 lg:px-10"
      onPointerDown={stopBubble}
    >
      <div className="mx-auto grid w-full max-w-[90rem] grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
        <Link
          to="/shop"
          replace
          onClick={onLeave}
          className="flex shrink-0 items-center justify-self-start gap-2 sm:gap-2.5"
        >
          <img
            src="/shop-logo.png"
            alt=""
            className="h-8 w-8 rounded-lg object-cover ring-1 ring-amber-200/25 sm:h-9 sm:w-9"
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).style.display = 'none'
            }}
          />
          <BrandName className="font-display text-xs font-bold tracking-[0.16em] sm:text-sm lg:text-base" />
        </Link>

        <LandingFeatureRailHeader />

        <div className="relative z-10 flex shrink-0 items-center justify-self-end gap-1.5 sm:gap-2">
          {loading ? (
            <div className="h-8 w-[9.5rem] animate-pulse rounded-full bg-white/10 sm:w-[10.5rem]" />
          ) : user ? (
            <Link
              to="/account"
              className={`btn-royal-outline ${authBtnBase}`}
              onClick={stopBubble}
              onPointerDown={stopBubble}
            >
              Account
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className={`btn-royal-outline ${authBtnBase}`}
                onClick={stopBubble}
                onPointerDown={stopBubble}
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className={`btn-royal-gold-outline ${authBtnBase}`}
                onClick={stopBubble}
                onPointerDown={stopBubble}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
