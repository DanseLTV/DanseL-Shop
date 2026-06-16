const LANDING_SEEN_KEY = 'dansel-landing-seen'

export function hasSeenLanding(): boolean {
  try {
    return localStorage.getItem(LANDING_SEEN_KEY) === '1'
  } catch {
    return false
  }
}

export function markLandingSeen(): void {
  try {
    localStorage.setItem(LANDING_SEEN_KEY, '1')
  } catch {
    /* private browsing / storage blocked */
  }
}

/** URL query that re-opens the splash without clearing localStorage */
export const LANDING_PREVIEW_PATH = '/?preview=1'

export function isLandingPreview(search: string): boolean {
  return new URLSearchParams(search).get('preview') === '1'
}
