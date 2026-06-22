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
  username: string
  email: string
  phone: string
  role: UserRole
  created_at?: string
  email_verified_at?: string | null
  /** @deprecated legacy column — use username */
  full_name?: string
}

export interface OrderRecord {
  id: string
  user_id: string
  product_id: string
  product_name: string
  amount: number
  payment_method: string
  notes: string | null
  proof_url?: string | null
  status: 'pending' | 'paid' | 'delivered' | 'cancelled'
  quantity?: number
  created_at: string
  customer_last_read_at?: string | null
  admin_last_read_at?: string | null
}

export interface OrderMessage {
  id: string
  order_id: string
  sender_id: string
  sender_role: UserRole
  body: string
  created_at: string
  updated_at?: string | null
  deleted_at?: string | null
  deleted_by?: string | null
}

export function isMessageDeleted(msg: OrderMessage) {
  return Boolean(msg.deleted_at)
}

export function activeMessagesOnly(messages: OrderMessage[]) {
  return messages.filter((m) => !m.deleted_at)
}

export interface OrderWithCustomer extends OrderRecord {
  profiles?: { username: string; email?: string; phone?: string } | null
}

export type NotificationType = 'order_status' | 'new_order' | 'new_message'

export interface AppNotification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string
  order_id: string | null
  link_path: string
  read_at: string | null
  created_at: string
}
