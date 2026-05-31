-- Run after schema-email-otp-4.sql to confirm setup

-- 1) Table exists
select to_regclass('public.email_otp_verifications') as otp_table;

-- 2) RPC functions exist
select proname
from pg_proc
where proname in (
  'issue_email_otp',
  'verify_signup_email_otp',
  'complete_recovery_with_otp'
)
order by proname;

-- 3) Resend vault secret (should be 1 row)
select count(*) as resend_key_configured
from vault.secrets
where name = 'resend_api_key';

-- 4) pg_net enabled (needed to send email from SQL)
select extname, nspname
from pg_extension e
join pg_namespace n on n.oid = e.extnamespace
where extname in ('pgcrypto', 'pg_net');
