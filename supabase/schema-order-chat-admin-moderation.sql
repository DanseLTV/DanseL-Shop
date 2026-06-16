-- Run in Supabase SQL Editor (after schema-messages.sql + patch-admin-rls-storage-chat.sql)
-- Lets admins edit/unsend their replies and clear an order conversation.

alter table public.order_messages
  add column if not exists updated_at timestamptz;

drop policy if exists "Admins update own chat messages" on public.order_messages;
create policy "Admins update own chat messages"
  on public.order_messages for update
  to authenticated
  using (
    public.is_admin_uid(auth.uid())
    and sender_role = 'admin'
    and sender_id = auth.uid()
  )
  with check (
    public.is_admin_uid(auth.uid())
    and sender_role = 'admin'
    and sender_id = auth.uid()
    and char_length(trim(body)) > 0
    and char_length(body) <= 4000
  );

drop policy if exists "Admins delete chat messages" on public.order_messages;
create policy "Admins delete chat messages"
  on public.order_messages for delete
  to authenticated
  using (public.is_admin_uid(auth.uid()));
