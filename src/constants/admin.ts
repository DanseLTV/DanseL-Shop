/** Primary admin account — signs in through the same /login page as customers. */
export const ADMIN_EMAIL = 'russeldangarfin@gmail.com'

const ADMIN_WELCOME_TOAST_KEY = 'dansel-admin-welcome-toast'

export function isAdminEmail(email: string | null | undefined): boolean {
  return email?.trim().toLowerCase() === ADMIN_EMAIL
}

/** Set before redirecting to /admin so the dashboard can show a welcome toast. */
export function markAdminWelcomeToast(): void {
  try {
    sessionStorage.setItem(ADMIN_WELCOME_TOAST_KEY, '1')
  } catch {
    /* ignore */
  }
}

/** Read once — returns true the first time after admin login. */
export function consumeAdminWelcomeToast(): boolean {
  try {
    if (sessionStorage.getItem(ADMIN_WELCOME_TOAST_KEY) !== '1') return false
    sessionStorage.removeItem(ADMIN_WELCOME_TOAST_KEY)
    return true
  } catch {
    return false
  }
}
