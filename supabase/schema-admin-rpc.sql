-- Run in Supabase SQL Editor
-- Creates a SECURITY DEFINER RPC to check admin role without triggering RLS recursion.

create or replace function public.is_admin_uid(uid uuid)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  return exists (
    select 1
    from public.profiles p
    where p.id = uid
      and p.role = 'admin'
  );
end;
$$;

grant execute on function public.is_admin_uid(uuid) to anon, authenticated;

