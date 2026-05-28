import { supabase } from './supabase'

export async function checkIsAdminUid(userId: string): Promise<{
  isAdmin: boolean
  errorMessage?: string
}> {
  if (!supabase) return { isAdmin: false, errorMessage: 'Supabase is not configured.' }

  const { data, error } = await supabase.rpc('is_admin_uid', { uid: userId })

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
}
