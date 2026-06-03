-- Split forgot-password: verify OTP first, then reset password
-- Run in Supabase SQL Editor

alter table public.email_otp_verifications
  add column if not exists verified_at timestamptz;

create or replace function public.verify_recovery_email_otp(
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
begin
  if length(v_code) <> 4 or v_code !~ '^\d{4}$' then
    raise exception 'Invalid verification code';
  end if;

  select * into v_row
  from public.email_otp_verifications
  where lower(email) = v_email
    and purpose = 'recovery'
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

  if not exists (
    select 1 from auth.users where lower(email) = v_email
  ) then
    raise exception 'Account not found';
  end if;

  update public.email_otp_verifications
  set verified_at = now()
  where id = v_row.id;

  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.reset_password_after_recovery(
  p_email text,
  p_new_password text
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_email text := lower(trim(p_email));
  v_row public.email_otp_verifications%rowtype;
  v_user_id uuid;
begin
  if p_new_password is null or length(p_new_password) < 6 then
    raise exception 'Password must be at least 6 characters';
  end if;

  select * into v_row
  from public.email_otp_verifications
  where lower(email) = v_email
    and purpose = 'recovery'
    and verified_at is not null
  order by verified_at desc
  limit 1;

  if v_row.id is null then
    raise exception 'Please verify the recovery code first';
  end if;

  if v_row.expires_at < now() then
    raise exception 'Verification code expired';
  end if;

  if v_row.verified_at < now() - interval '15 minutes' then
    raise exception 'Recovery session expired. Request a new code.';
  end if;

  select id into v_user_id
  from auth.users
  where lower(email) = v_email
  limit 1;

  if v_user_id is null then
    raise exception 'Account not found';
  end if;

  update auth.users
  set encrypted_password = crypt(p_new_password, gen_salt('bf'))
  where id = v_user_id;

  delete from public.email_otp_verifications where id = v_row.id;

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.verify_recovery_email_otp(text, text) to anon, authenticated;
grant execute on function public.reset_password_after_recovery(text, text) to anon, authenticated;
