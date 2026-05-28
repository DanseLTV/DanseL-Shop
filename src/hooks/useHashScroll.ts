import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Smooth-scroll to #section when landing on /home#faq etc. */
export function useHashScroll() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash || pathname !== '/home') return
    const id = hash.replace('#', '')
    const timer = window.setTimeout(() => {
      const el = document.getElementById(id)
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 88
        window.scrollTo({ top, behavior: 'smooth' })
      }
    }, 150)
    return () => window.clearTimeout(timer)
  }, [pathname, hash])
}
