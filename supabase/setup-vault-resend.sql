-- Run AFTER schema-email-otp-4.sql
-- Replace YOUR_RESEND_API_KEY with your Resend key (starts with re_)

-- Safe to re-run: updates key if it exists, creates if missing
do $$
declare
  v_secret_id uuid;
begin
  select id into v_secret_id
  from vault.secrets
  where name = 'resend_api_key'
  limit 1;

  if v_secret_id is null then
    perform vault.create_secret(
      'YOUR_RESEND_API_KEY',
      'resend_api_key',
      'Resend API key for 4-digit OTP emails'
    );
  else
    perform vault.update_secret(v_secret_id, 'YOUR_RESEND_API_KEY');
  end if;
end $$;

-- Verify (should return 1 row, value hidden):
select name, created_at
from vault.secrets
where name = 'resend_api_key';
