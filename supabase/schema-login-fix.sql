-- Fix login error: "Database error querying schema"
-- Cause: GoTrue cannot read NULL in auth.users token columns (needs '' not NULL)
-- Run once in Supabase SQL Editor (hosted — no ALTER on auth.users)

-- 1) Repair existing users (NULL tokens → empty string)
create or replace function public.repair_auth_null_tokens()
returns void
language plpgsql
security definer
set search_path = auth, public
as $$
begin
  update auth.users
  set confirmation_token = ''
  where confirmation_token is null;

  update auth.users
  set recovery_token = ''
  where recovery_token is null;

  update auth.users
  set email_change_token_new = ''
  where email_change_token_new is null;

  update auth.users
  set email_change = ''
  where email_change is null;

  update auth.users
  set email_change_token_current = ''
  where email_change_token_current is null;
end;
$$;

select public.repair_auth_null_tokens();

drop function if exists public.repair_auth_null_tokens();

-- 2) OTP verify must use empty strings, never NULL
create or replace function public.verify_signup_email_otp(
  p_email text,
  p_code text
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_email text := lower(trim(p_email));
  v_code text := trim(p_code);
  v_row public.email_otp_verifications%rowtype;
  v_user_id uuid;
begin
  if length(v_code) <> 4 or v_code !~ '^\d{4}$' then
    raise exception 'Invalid verification code';
  end if;

  select * into v_row
  from public.email_otp_verifications
  where lower(email) = v_email
    and purpose = 'signup'
  order by created_at desc
  limit 1;

  if v_row.id is null then
    raise exception 'Invalid verification code';
  end if;

  if v_row.expires_at < now() then
    raise exception 'Verification code expired';
  end if;

  if v_row.attempts >= 5 then
    raise exception 'Too many attempts. Request a new code.';
  end if;

  if v_row.code_hash <> public._otp_email_hash(v_code) then
    update public.email_otp_verifications
    set attempts = attempts + 1
    where id = v_row.id;
    raise exception 'Invalid verification code';
  end if;

  select id into v_user_id
  from auth.users
  where lower(email) = v_email
  limit 1;

  if v_user_id is null then
    raise exception 'Account not found';
  end if;

  update auth.users
  set
    email_confirmed_at = coalesce(email_confirmed_at, now()),
    confirmation_token = '',
    confirmation_sent_at = null
  where id = v_user_id;

  update public.profiles
  set email_verified_at = now()
  where id = v_user_id;

  delete from public.email_otp_verifications where id = v_row.id;

  return jsonb_build_object('ok', true);
end;
$$;
