-- Run in Supabase SQL Editor (after schema.sql + username migration)
-- In-app messaging per order (buyer ↔ admin)

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- Track last read for unread hints
alter table public.orders add column if not exists customer_last_read_at timestamptz;
alter table public.orders add column if not exists admin_last_read_at timestamptz;

create table if not exists public.order_messages (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  sender_role text not null check (sender_role in ('customer', 'admin')),
  body text not null check (char_length(trim(body)) > 0 and char_length(body) <= 4000),
  created_at timestamptz default now()
);

create index if not exists order_messages_order_id_idx on public.order_messages (order_id, created_at);

alter table public.order_messages enable row level security;

drop policy if exists "Read messages for own orders or admin" on public.order_messages;
create policy "Read messages for own orders or admin"
  on public.order_messages for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "Customers send on own orders" on public.order_messages;
create policy "Customers send on own orders"
  on public.order_messages for insert
  with check (
    sender_id = auth.uid()
    and sender_role = 'customer'
    and exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

drop policy if exists "Admins send on any order" on public.order_messages;
create policy "Admins send on any order"
  on public.order_messages for insert
  with check (
    sender_id = auth.uid()
    and sender_role = 'admin'
    and public.is_admin()
  );

drop policy if exists "Customers update read on own orders" on public.orders;
create policy "Customers update read on own orders"
  on public.orders for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Realtime (required for live chat)
alter publication supabase_realtime add table public.order_messages;
