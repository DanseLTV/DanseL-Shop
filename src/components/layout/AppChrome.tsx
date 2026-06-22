import { useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { ScreenEdgeFire } from './ScreenEdgeFire'
import { FloatingMessageButton } from './FloatingMessageButton'
import { MobileBottomNav } from './MobileBottomNav'
import { RoyalCustomerShell } from './RoyalCustomerShell'

export function useIsCustomerShopChrome() {
  const { pathname } = useLocation()
  return !pathname.startsWith('/admin') || pathname === '/admin/login'
}

export function useIsLandingPage() {
  const { pathname } = useLocation()
  return pathname === '/'
}

const AUTH_PATHS = ['/login', '/signup', '/forgot-password']

export function useIsAuthPage() {
  const { pathname } = useLocation()
  return AUTH_PATHS.includes(pathname)
}

export function AppChrome() {
  const showChrome = useIsCustomerShopChrome()
  const isLanding = useIsLandingPage()
  const isAuth = useIsAuthPage()
  if (!showChrome) return null

  return (
    <>
      {!isLanding && !isAuth && <ScreenEdgeFire />}
      {!isLanding && <Navbar />}
      {!isLanding && !isAuth && <FloatingMessageButton />}
      {!isLanding && !isAuth && <MobileBottomNav />}
    </>
  )
}

export function AppFooter() {
  const showChrome = useIsCustomerShopChrome()
  const isLanding = useIsLandingPage()
  const isAuth = useIsAuthPage()
  if (!showChrome || isLanding || isAuth) return null

  return <Footer />
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const isLanding = useIsLandingPage()
  const isAuth = useIsAuthPage()

  return (
    <div
      className={
        isLanding
          ? 'relative flex min-h-dvh flex-col overflow-x-hidden'
          : isAuth
            ? 'relative flex h-dvh max-h-dvh flex-col overflow-hidden'
            : 'relative flex min-h-dvh flex-col overflow-x-hidden'
      }
    >
      {children}
    </div>
  )
}

export function AppMain({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()
  const isLanding = useIsLandingPage()
  const isAuth = useIsAuthPage()
  const isAdmin = pathname.startsWith('/admin')
  const useRoyalShell = !isLanding && !isAdmin

  const content = useRoyalShell ? <RoyalCustomerShell>{children}</RoyalCustomerShell> : children

  return (
    <main
      className={
        isLanding
          ? 'relative z-10 flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain scroll-smooth [-webkit-overflow-scrolling:touch]'
          : isAuth
            ? 'relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden pt-[4.25rem]'
            : 'relative z-10 flex flex-1 flex-col overflow-x-hidden'
      }
    >
      {content}
    </main>
  )
}