-- Run in Supabase SQL Editor (after schema.sql + username migration + messages + admin-rpc)

-- Ensure profile row exists for logged-in user (fixes order foreign key errors)
create or replace function public.ensure_my_profile()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  uname text;
  uemail text;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  select
    coalesce(
      nullif(trim(raw_user_meta_data->>'username'), ''),
      nullif(trim(split_part(email, '@', 1)), ''),
      'user'
    ),
    lower(trim(email))
  into uname, uemail
  from auth.users
  where id = uid;

  insert into public.profiles (id, username, email, full_name, phone, role)
  values (uid, lower(uname), coalesce(uemail, ''), uname, '', 'customer')
  on conflict (id) do update
  set
    email = coalesce(excluded.email, public.profiles.email),
    username = coalesce(public.profiles.username, excluded.username);
end;
$$;

grant execute on function public.ensure_my_profile() to authenticated;

-- Safe order creation (ensures profile first)
create or replace function public.create_order(
  p_product_id text,
  p_product_name text,
  p_amount numeric,
  p_payment_method text,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  perform public.ensure_my_profile();

  insert into public.orders (
    user_id,
    product_id,
    product_name,
    amount,
    payment_method,
    notes,
    status
  )
  values (
    auth.uid(),
    p_product_id,
    p_product_name,
    p_amount,
    p_payment_method,
    p_notes,
    'pending'
  )
  returning id into new_id;

  return new_id;
end;
$$;

grant execute on function public.create_order(text, text, numeric, text, text) to authenticated;

-- Set your admin account (run once; safe to re-run)
update public.profiles
set role = 'admin'
where lower(email) = 'russeldangarfin@gmail.com';
