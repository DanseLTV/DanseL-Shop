-- Run once in Supabase SQL Editor
-- Requires: Authentication → Providers → Email → Confirm email OFF
--
-- The old trigger that UPDATEd auth.users after insert caused:
-- "Database error loading user after sign-up"
-- Verification is tracked on profiles.email_verified_at instead.

-- Remove broken trigger
drop trigger if exists trg_force_new_user_unverified on auth.users;
drop function if exists public.force_new_user_unverified();

alter table public.profiles
  add column if not exists email_verified_at timestamptz;

-- Existing confirmed users stay verified
update public.profiles p
set email_verified_at = coalesce(p.email_verified_at, now())
from auth.users u
where p.id = u.id
  and u.email_confirmed_at is not null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, email, full_name, phone, role, email_verified_at)
  values (
    new.id,
    lower(trim(coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1), 'user'))),
    new.email,
    coalesce(new.raw_user_meta_data->>'username', 'Customer'),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    'customer',
    null
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

create or replace function public.auth_user_exists(p_email text)
returns boolean
language sql
security definer
set search_path = auth, public
as $$
  select exists (
    select 1
    from auth.users
    where lower(email) = lower(trim(p_email))
  );
$$;

grant execute on function public.auth_user_exists(text) to anon, authenticated;
