-- Run in Supabase SQL Editor if admin image upload or chat shows
-- "new row violates row-level security policy"
-- Safe to re-run.

-- Admin helpers (security definer — bypasses profile RLS)
create or replace function public.is_admin_uid(uid uuid)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if uid is null then
    return false;
  end if;
  return exists (
    select 1 from public.profiles p
    where p.id = uid and p.role = 'admin'
  );
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.is_admin_uid(auth.uid());
$$;

grant execute on function public.is_admin_uid(uuid) to anon, authenticated;
grant execute on function public.is_admin() to authenticated;

-- Storage bucket
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images"
  on storage.objects for select
  to public
  using (bucket_id = 'product-images');

drop policy if exists "Admins upload product images" on storage.objects;
create policy "Admins upload product images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and public.is_admin_uid(auth.uid())
  );

drop policy if exists "Admins update product images" on storage.objects;
create policy "Admins update product images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'product-images'
    and public.is_admin_uid(auth.uid())
  )
  with check (
    bucket_id = 'product-images'
    and public.is_admin_uid(auth.uid())
  );

drop policy if exists "Admins delete product images" on storage.objects;
create policy "Admins delete product images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'product-images'
    and public.is_admin_uid(auth.uid())
  );

-- Admin chat send (re-apply in case is_admin() was stale)
drop policy if exists "Admins send on any order" on public.order_messages;
create policy "Admins send on any order"
  on public.order_messages for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and sender_role = 'admin'
    and public.is_admin_uid(auth.uid())
  );

-- Admin can update orders (status + read timestamps)
drop policy if exists "Admins update orders" on public.orders;
create policy "Admins update orders"
  on public.orders for update
  to authenticated
  using (public.is_admin_uid(auth.uid()))
  with check (public.is_admin_uid(auth.uid()));

-- Product CMS overrides
drop policy if exists "Admins upsert product overrides" on public.product_overrides;
create policy "Admins upsert product overrides"
  on public.product_overrides for insert
  to authenticated
  with check (public.is_admin_uid(auth.uid()));

drop policy if exists "Admins update product overrides" on public.product_overrides;
create policy "Admins update product overrides"
  on public.product_overrides for update
  to authenticated
  using (public.is_admin_uid(auth.uid()))
  with check (public.is_admin_uid(auth.uid()));

-- Full product catalog (admin CRUD)
drop policy if exists "Admins read all shop products" on public.shop_products;
create policy "Admins read all shop products"
  on public.shop_products for select
  to authenticated
  using (public.is_admin_uid(auth.uid()));

drop policy if exists "Admins insert shop products" on public.shop_products;
create policy "Admins insert shop products"
  on public.shop_products for insert
  to authenticated
  with check (public.is_admin_uid(auth.uid()));

drop policy if exists "Admins update shop products" on public.shop_products;
create policy "Admins update shop products"
  on public.shop_products for update
  to authenticated
  using (public.is_admin_uid(auth.uid()))
  with check (public.is_admin_uid(auth.uid()));

drop policy if exists "Admins delete shop products" on public.shop_products;
create policy "Admins delete shop products"
  on public.shop_products for delete
  to authenticated
  using (public.is_admin_uid(auth.uid()));
