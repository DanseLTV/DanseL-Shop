-- Run AFTER schema-email-otp-4.sql
-- Replace YOUR_RESEND_API_KEY with your Resend key (starts with re_)

-- First time: create secret
select vault.create_secret(
  'YOUR_RESEND_API_KEY',
  'resend_api_key',
  'Resend API key for 4-digit OTP emails'
);

-- If secret already exists, use this instead (comment out create_secret above):
-- select vault.update_secret(
--   (select id from vault.secrets where name = 'resend_api_key' limit 1),
--   'YOUR_RESEND_API_KEY'
-- );

-- Verify (should return 1 row, value hidden):
select name, created_at
from vault.secrets
where name = 'resend_api_key';
