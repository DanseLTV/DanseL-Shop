-- Run in Supabase SQL Editor after schema.sql and schema-messages.sql
-- Safe to re-run (drops policies first if they already exist)

-- Payment proof URL on orders
alter table public.orders
  add column if not exists proof_url text;

-- Storage bucket for payment screenshots (public read so admin/customer can view)
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', true)
on conflict (id) do update set public = true;

-- Customers upload to their own folder
drop policy if exists "Users upload own payment proofs" on storage.objects;
create policy "Users upload own payment proofs"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'payment-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users update own payment proofs" on storage.objects;
create policy "Users update own payment proofs"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'payment-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Public read payment proofs" on storage.objects;
create policy "Public read payment proofs"
  on storage.objects for select
  to public
  using (bucket_id = 'payment-proofs');
