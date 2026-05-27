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
