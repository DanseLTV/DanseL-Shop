/** Normalize username: lowercase, letters, numbers, underscore only */
export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
}

export function isValidUsername(username: string): boolean {
  return /^[a-z0-9_]{3,20}$/.test(username)
}

export function looksLikeEmail(value: string): boolean {
  return value.trim().includes('@')
}

/** Strip leading @ when user types @username (shown on profile page). */
export function normalizeLoginIdentifier(identifier: string): string {
  const trimmed = identifier.trim()
  if (trimmed.startsWith('@') && !trimmed.slice(1).includes('@')) {
    return trimmed.slice(1)
  }
  return trimmed
}

export function isAccountVerified(
  profile: {
    role?: string
    email_verified_at?: string | null
  } | null,
  authUser?: { email_confirmed_at?: string | null } | null
): boolean {
  if (profile?.role === 'admin') return true
  if (profile?.email_verified_at) return true
  if (authUser?.email_confirmed_at) return true
  return false
}
