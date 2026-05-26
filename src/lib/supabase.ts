import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null

export type UserRole = 'customer' | 'admin'

export interface UserProfile {
  id: string
  full_name: string
  phone: string
  role: UserRole
  created_at?: string
}

export interface OrderRecord {
  id: string
  user_id: string
  product_id: string
  product_name: string
  amount: number
  payment_method: string
  notes: string | null
  status: 'pending' | 'paid' | 'delivered' | 'cancelled'
  created_at: string
}
