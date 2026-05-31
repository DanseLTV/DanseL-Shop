-- 4-digit email OTP (signup + password recovery)
-- Run in Supabase SQL Editor after schema-flow-fix.sql
--
-- 1) Vault secret (Dashboard → Project Settings → Vault): name = resend_api_key, value = your Resend API key
-- 2) Confirm signup / Recovery email templates: use only a 4-digit code (not {{ .Token }} from Supabase)
-- 3) Optional: Auth Send Email Hook → supabase/functions/auth-send-email (stops long default codes)

create extension if not exists pgcrypto;
create extension if not exists pg_net with schema extensions;

create table if not exists public.email_otp_verifications (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  purpose text not null check (purpose in ('signup', 'recovery')),
  code_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists email_otp_verifications_lookup_idx
  on public.email_otp_verifications (lower(email), purpose, expires_at desc);

alter table public.email_otp_verifications enable row level security;

create or replace function public._otp_email_hash(p_code text)
returns text
language sql
immutable
as $$
  select encode(digest(trim(p_code), 'sha256'), 'hex');
$$;

create or replace function public._send_otp_email_via_resend(
  p_email text,
  p_code text,
  p_purpose text
)
returns void
language plpgsql
security definer
set search_path = public, extensions, net
as $$
declare
  v_key text;
  v_subject text;
  v_body text;
begin
  begin
    select decrypted_secret into v_key
    from vault.decrypted_secrets
    where name = 'resend_api_key'
    limit 1;
  exception
    when others then
      v_key := null;
  end;

  if v_key is null or length(trim(v_key)) = 0 then
    return;
  end if;

  if p_purpose = 'signup' then
    v_subject := 'Your DANSEL SHOP signup code';
    v_body := format(
      '<p>Your verification code is: <strong style="font-size:24px;letter-spacing:4px">%s</strong></p><p>This code expires in 10 minutes.</p>',
      p_code
    );
  else
    v_subject := 'Your DANSEL SHOP password reset code';
    v_body := format(
      '<p>Your password reset code is: <strong style="font-size:24px;letter-spacing:4px">%s</strong></p><p>This code expires in 10 minutes.</p>',
      p_code
    );
  end if;

  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_key
    ),
    body := jsonb_build_object(
      'from', 'DANSEL SHOP <support@danselshop.site>',
      'to', jsonb_build_array(p_email),
      'subject', v_subject,
      'html', v_body
    )
  );
exception
  when others then
    null;
end;
$$;

create or replace function public.issue_email_otp(
  p_email text,
  p_purpose text
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_email text := lower(trim(p_email));
  v_purpose text := lower(trim(p_purpose));
  v_user_id uuid;
  v_code text;
  v_hash text;
begin
  if v_email is null or v_email = '' then
    raise exception 'Email is required';
  end if;

  if v_purpose not in ('signup', 'recovery') then
    raise exception 'Invalid OTP purpose';
  end if;

  select id into v_user_id
  from auth.users
  where lower(email) = v_email
  limit 1;

  if v_user_id is null then
    if v_purpose = 'recovery' then
      return jsonb_build_object('ok', true);
    end if;
    raise exception 'No account found for this email';
  end if;

  if v_purpose = 'signup' and exists (
    select 1 from auth.users
    where id = v_user_id and email_confirmed_at is not null
  ) then
    raise exception 'Email is already verified';
  end if;

  v_code := lpad((floor(random() * 10000))::int::text, 4, '0');
  v_hash := public._otp_email_hash(v_code);

  delete from public.email_otp_verifications
  where lower(email) = v_email and purpose = v_purpose;

  insert into public.email_otp_verifications (email, purpose, code_hash, expires_at)
  values (v_email, v_purpose, v_hash, now() + interval '10 minutes');

  perform public._send_otp_email_via_resend(v_email, v_code, v_purpose);

  return jsonb_build_object('ok', true);
end;
$$;

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
    confirmation_token = null,
    confirmation_sent_at = null
  where id = v_user_id;

  delete from public.email_otp_verifications where id = v_row.id;

  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.complete_recovery_with_otp(
  p_email text,
  p_code text,
  p_new_password text
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
  if p_new_password is null or length(p_new_password) < 6 then
    raise exception 'Password must be at least 6 characters';
  end if;

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

grant execute on function public.issue_email_otp(text, text) to anon, authenticated;
grant execute on function public.verify_signup_email_otp(text, text) to anon, authenticated;
grant execute on function public.complete_recovery_with_otp(text, text, text) to anon, authenticated;
