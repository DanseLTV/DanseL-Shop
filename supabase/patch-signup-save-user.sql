-- Fix "Database error saving new user" on sign up.
-- Run in Supabase SQL Editor (safe to re-run).

alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists email_verified_at timestamptz;

create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username));

-- Anon signup can check username before auth.users insert (RLS blocks direct profiles reads).
create or replace function public.is_username_available(p_username text)
returns boolean
language sql
security definer
set search_path = public, auth
as $$
  select not exists (
    select 1
    from public.profiles
    where lower(username) = lower(trim(p_username))
  )
  and not exists (
    select 1
    from auth.users
    where lower(coalesce(raw_user_meta_data->>'username', '')) = lower(trim(p_username))
  );
$$;

grant execute on function public.is_username_available(text) to anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_username text;
begin
  v_username := lower(trim(coalesce(
    nullif(new.raw_user_meta_data->>'username', ''),
    nullif(split_part(new.email, '@', 1), ''),
    'user'
  )));

  if exists (
    select 1 from public.profiles where lower(username) = v_username
  ) then
    raise exception 'Username is already taken';
  end if;

  insert into public.profiles (id, username, email, full_name, phone, role, email_verified_at)
  values (
    new.id,
    v_username,
    lower(trim(new.email)),
    coalesce(nullif(new.raw_user_meta_data->>'username', ''), 'Customer'),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    'customer',
    null
  )
  on conflict (id) do update set
    email = coalesce(excluded.email, public.profiles.email),
    username = coalesce(public.profiles.username, excluded.username),
    full_name = coalesce(public.profiles.full_name, excluded.full_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Repair orphaned auth users missing a profile row (from past failed signups).
insert into public.profiles (id, username, email, full_name, phone, role, email_verified_at)
select
  u.id,
  lower(trim(coalesce(
    nullif(u.raw_user_meta_data->>'username', ''),
    nullif(split_part(u.email, '@', 1), ''),
    'user'
  ))),
  lower(trim(u.email)),
  coalesce(nullif(u.raw_user_meta_data->>'username', ''), 'Customer'),
  coalesce(u.raw_user_meta_data->>'phone', ''),
  'customer',
  case when u.email_confirmed_at is not null then u.email_confirmed_at else null end
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;
