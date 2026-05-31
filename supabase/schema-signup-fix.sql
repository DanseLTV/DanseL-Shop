-- Run once in Supabase SQL Editor
-- Also required: Authentication → Providers → Email → turn OFF "Confirm email"
-- (Signup will succeed without Supabase SMTP; users must still enter 4-digit OTP to verify.)

create or replace function public.force_new_user_unverified()
returns trigger
language plpgsql
security definer
set search_path = auth, public
as $$
begin
  update auth.users
  set
    email_confirmed_at = null,
    confirmation_token = null,
    confirmation_sent_at = null
  where id = new.id;

  return new;
end;
$$;

drop trigger if exists trg_force_new_user_unverified on auth.users;

create trigger trg_force_new_user_unverified
  after insert on auth.users
  for each row
  execute function public.force_new_user_unverified();

-- Optional: check if auth user exists (for debugging)
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
