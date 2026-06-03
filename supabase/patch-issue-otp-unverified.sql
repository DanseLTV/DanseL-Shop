-- Fix signup OTP when Confirm email is OFF (auth.users.email_confirmed_at is set immediately)

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
    select 1 from public.profiles
    where id = v_user_id and email_verified_at is not null
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
