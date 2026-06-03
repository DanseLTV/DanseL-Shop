-- Self-service account deletion (run in Supabase SQL Editor)

create or replace function public.delete_my_account(p_username text)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  uid uuid := auth.uid();
  v_username text;
  v_email text;
  v_role text;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  select lower(trim(username)), lower(trim(email)), role
  into v_username, v_email, v_role
  from public.profiles
  where id = uid;

  if v_username is null then
    raise exception 'Profile not found';
  end if;

  if v_role = 'admin' then
    raise exception 'Admin accounts cannot be deleted here';
  end if;

  if lower(trim(p_username)) <> v_username then
    raise exception 'Username does not match';
  end if;

  delete from public.email_otp_verifications
  where lower(email) = coalesce(v_email, '');

  delete from auth.users where id = uid;

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.delete_my_account(text) to authenticated;
