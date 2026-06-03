-- Re-run if 4-digit OTP emails are not arriving (fixes pg_net search_path)
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
    ),
    timeout_milliseconds := 2000
  );
exception
  when others then
    null;
end;
$$;
