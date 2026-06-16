-- Run in Supabase SQL Editor (after schema-messages.sql)
-- Every order gets a chat thread; admin auto-welcome on first customer message.

create or replace function public.primary_admin_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select id from public.profiles where role = 'admin' order by created_at asc limit 1;
$$;

grant execute on function public.primary_admin_id() to authenticated;

create or replace function public.ensure_order_chat_thread(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  o public.orders%rowtype;
  admin_id uuid;
begin
  select * into o from public.orders where id = p_order_id;
  if not found then
    return;
  end if;

  if exists (select 1 from public.order_messages where order_id = p_order_id) then
    return;
  end if;

  insert into public.order_messages (order_id, sender_id, sender_role, body)
  values (
    p_order_id,
    o.user_id,
    'customer',
    format(
      E'New order: %s\nPayment: %s\nAmount: ₱%s\nChat thread started — message admin here anytime.',
      o.product_name,
      o.payment_method,
      trim(to_char(o.amount, 'FM999,999,990.00'))
    )
  );

  admin_id := public.primary_admin_id();
  if admin_id is not null then
    insert into public.order_messages (order_id, sender_id, sender_role, body)
    values (
      p_order_id,
      admin_id,
      'admin',
      'Thanks for your order! We received your request and will verify your payment shortly. Reply here if you have questions.'
    );
  end if;
end;
$$;

grant execute on function public.ensure_order_chat_thread(uuid) to authenticated;

create or replace function public.trg_customer_message_admin_welcome()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_id uuid;
begin
  if new.sender_role <> 'customer' then
    return new;
  end if;

  if exists (
    select 1 from public.order_messages
    where order_id = new.order_id and sender_role = 'admin'
  ) then
    return new;
  end if;

  admin_id := public.primary_admin_id();
  if admin_id is null then
    return new;
  end if;

  insert into public.order_messages (order_id, sender_id, sender_role, body)
  values (
    new.order_id,
    admin_id,
    'admin',
    'Thanks for your order! We received your request and will verify your payment shortly. Reply here if you have questions.'
  );

  return new;
end;
$$;

drop trigger if exists order_messages_admin_welcome on public.order_messages;
create trigger order_messages_admin_welcome
  after insert on public.order_messages
  for each row
  execute function public.trg_customer_message_admin_welcome();

-- Backfill older orders that have no chat messages yet
do $$
declare
  r record;
begin
  for r in
    select o.id
    from public.orders o
    where not exists (
      select 1 from public.order_messages m where m.order_id = o.id
    )
  loop
    perform public.ensure_order_chat_thread(r.id);
  end loop;
end $$;
