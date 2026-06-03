-- Run in Supabase SQL Editor if login fails for verified users (email_verified_at out of sync)
-- Also fixes get_login_email when identifier is @username

create or replace function public.get_login_email(identifier text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  trimmed text := lower(trim(identifier));
begin
  if trimmed like '@%' and position('@' in substring(trimmed from 2)) = 0 then
    trimmed := substring(trimmed from 2);
  end if;

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

-- Sync profiles.email_verified_at from auth.users for legacy / drifted rows
update public.profiles p
set email_verified_at = coalesce(p.email_verified_at, now())
from auth.users u
where p.id = u.id
  and p.email_verified_at is null
  and u.email_confirmed_at is not null;

create or replace function public.sync_email_verified_status()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  update public.profiles p
  set email_verified_at = now()
  from auth.users u
  where p.id = auth.uid()
    and u.id = auth.uid()
    and p.email_verified_at is null
    and u.email_confirmed_at is not null;
end;
$$;

grant execute on function public.sync_email_verified_status() to authenticated;

-- Repair NULL auth token columns (GoTrue "Database error querying schema")
create or replace function public.repair_auth_null_tokens()
returns void
language plpgsql
security definer
set search_path = auth, public
as $$
begin
  update auth.users
  set confirmation_token = coalesce(confirmation_token, ''),
      recovery_token = coalesce(recovery_token, ''),
      email_change_token_new = coalesce(email_change_token_new, ''),
      email_change = coalesce(email_change, ''),
      email_change_token_current = coalesce(email_change_token_current, '')
  where confirmation_token is null
     or recovery_token is null
     or email_change_token_new is null
     or email_change is null
     or email_change_token_current is null;
end;
$$;

select public.repair_auth_null_tokens();

drop function if exists public.repair_auth_null_tokens();
