-- Run in Supabase SQL Editor (after initial schema)
-- Adds username + email for login with username OR email

alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists email text;

-- Migrate existing rows (full_name → username if empty)
update public.profiles
set username = lower(regexp_replace(coalesce(full_name, 'user'), '[^a-zA-Z0-9_]', '', 'g'))
where username is null or username = '';

update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and (p.email is null or p.email = '');

create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username));

-- Updated signup trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, email, full_name, phone, role)
  values (
    new.id,
    lower(trim(coalesce(new.raw_user_meta_data->>'username', 'user'))),
    new.email,
    coalesce(new.raw_user_meta_data->>'username', 'Customer'),
    '',
    'customer'
  );
  return new;
end;
$$;

-- Resolve email when logging in with username
create or replace function public.get_login_email(identifier text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  trimmed text := lower(trim(identifier));
begin
  if trimmed like '%@%' then
    return trimmed;
  end if;

  return (
    select email from public.profiles
    where lower(username) = trimmed
    limit 1
  );
end;
$$;

grant execute on function public.get_login_email(text) to anon, authenticated;
