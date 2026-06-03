-- Run in Supabase SQL Editor after schema-transaction-cms-fix.sql
-- Storage bucket for product card images uploaded by admin (public read)
-- Safe to re-run.

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

-- Anyone can view product images (shown on customer cards)
drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images"
  on storage.objects for select
  to public
  using (bucket_id = 'product-images');

-- Only admins can upload product images
drop policy if exists "Admins upload product images" on storage.objects;
create policy "Admins upload product images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and public.is_admin()
  );

-- Only admins can replace product images
drop policy if exists "Admins update product images" on storage.objects;
create policy "Admins update product images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'product-images'
    and public.is_admin()
  )
  with check (
    bucket_id = 'product-images'
    and public.is_admin()
  );

-- Only admins can delete product images
drop policy if exists "Admins delete product images" on storage.objects;
create policy "Admins delete product images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'product-images'
    and public.is_admin()
  );
