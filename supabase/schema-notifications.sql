-- In-app notifications for customers and admins (order status, new orders, chat).
-- Run after schema.sql and patch-admin-rls-storage-chat.sql

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('order_status', 'new_order', 'new_message')),
  title text not null,
  body text not null,
  order_id uuid references public.orders(id) on delete set null,
  link_path text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

create index if not exists notifications_user_unread_idx
  on public.notifications (user_id)
  where read_at is null;

alter table public.notifications enable row level security;

drop policy if exists "Users read own notifications" on public.notifications;
create policy "Users read own notifications"
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users update own notifications" on public.notifications;
create policy "Users update own notifications"
  on public.notifications for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Inserts go through security definer helpers only
create or replace function public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_body text,
  p_order_id uuid,
  p_link_path text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
  order_row public.orders%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if p_order_id is not null then
    select * into order_row from public.orders where id = p_order_id;
    if not found then
      raise exception 'Order not found';
    end if;

    if not (
      public.is_admin_uid(auth.uid())
      or order_row.user_id = auth.uid()
    ) then
      raise exception 'Not allowed to notify for this order';
    end if;
  elsif not public.is_admin_uid(auth.uid()) then
    raise exception 'Not allowed';
  end if;

  insert into public.notifications (user_id, type, title, body, order_id, link_path)
  values (p_user_id, p_type, p_title, p_body, p_order_id, p_link_path)
  returning id into new_id;

  return new_id;
end;
$$;

grant execute on function public.create_notification(uuid, text, text, text, uuid, text) to authenticated;

create or replace function public.notify_all_admins(
  p_type text,
  p_title text,
  p_body text,
  p_order_id uuid,
  p_link_path text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_row record;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if p_order_id is not null then
    if not exists (
      select 1 from public.orders
      where id = p_order_id and user_id = auth.uid()
    ) and not public.is_admin_uid(auth.uid()) then
      raise exception 'Not allowed';
    end if;
  end if;

  for admin_row in
    select id from public.profiles where role = 'admin'
  loop
    insert into public.notifications (user_id, type, title, body, order_id, link_path)
    values (admin_row.id, p_type, p_title, p_body, p_order_id, p_link_path);
  end loop;
end;
$$;

grant execute on function public.notify_all_admins(text, text, text, uuid, text) to authenticated;

-- Realtime for live bell updates
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;

alter table public.notifications replica identity full;
