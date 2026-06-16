-- Run in Supabase SQL Editor (after schema-order-chat-admin-moderation.sql)
-- Soft-delete: messages stay in DB for admin history; hidden from customers.

alter table public.order_messages
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references public.profiles(id) on delete set null;

create index if not exists order_messages_order_active_idx
  on public.order_messages (order_id, created_at)
  where deleted_at is null;

-- Customers see active messages only; admins see full history
drop policy if exists "Read messages for own orders or admin" on public.order_messages;
create policy "Read messages for own orders or admin"
  on public.order_messages for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (
          (o.user_id = auth.uid() and deleted_at is null)
          or public.is_admin_uid(auth.uid())
        )
    )
  );

-- Admin edit + soft-delete (replaces hard delete policy)
drop policy if exists "Admins update own chat messages" on public.order_messages;
drop policy if exists "Admins delete chat messages" on public.order_messages;

create policy "Admins manage chat messages"
  on public.order_messages for update
  to authenticated
  using (public.is_admin_uid(auth.uid()))
  with check (
    public.is_admin_uid(auth.uid())
    and (
      deleted_at is not null
      or (
        deleted_at is null
        and sender_role = 'admin'
        and sender_id = auth.uid()
        and char_length(trim(body)) > 0
        and char_length(body) <= 4000
      )
    )
  );
