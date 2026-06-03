import { supabase } from './supabase'
import { withTimeout } from '../utils/asyncHelpers'

export async function checkIsAdminUid(userId: string): Promise<{
  isAdmin: boolean
  errorMessage?: string
}> {
  if (!supabase) return { isAdmin: false, errorMessage: 'Supabase is not configured.' }

  try {
    const { data, error } = await withTimeout(
      supabase.rpc('is_admin_uid', { uid: userId }),
      6000,
      'Admin check timed out.'
    )

    if (error) {
      if (error.message.toLowerCase().includes('does not exist')) {
        return {
          isAdmin: false,
          errorMessage:
            'Missing is_admin_uid function. Run supabase/schema-admin-rpc.sql in SQL Editor.',
        }
      }
      return { isAdmin: false, errorMessage: error.message }
    }

    return { isAdmin: Boolean(data) }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Admin check failed.'
    if (message.toLowerCase().includes('timed out')) {
      return {
        isAdmin: false,
        errorMessage: 'Admin check timed out. Check your connection and try again.',
      }
    }
    return { isAdmin: false, errorMessage: message }
  }
}
