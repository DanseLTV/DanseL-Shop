import { useEffect } from 'react'

/** On desktop (lg+), lock document scroll so the landing page stays one full screen. */
export function useLandingDesktopLock(active: boolean) {
  useEffect(() => {
    if (!active) return

    const mq = window.matchMedia('(min-width: 1024px)')

    const apply = () => {
      document.documentElement.classList.toggle('overflow-hidden', mq.matches)
    }

    apply()
    mq.addEventListener('change', apply)

    return () => {
      mq.removeEventListener('change', apply)
      document.documentElement.classList.remove('overflow-hidden')
    }
  }, [active])
}
