-- Run this AFTER:
-- 1) schema.sql
-- 2) schema-username-migration.sql
-- 3) schema-messages.sql
-- 4) schema-admin-rpc.sql
-- 5) schema-order-proof.sql

-- 1) Safe admin checker helpers (no recursive profile policy checks)
create or replace function public.is_admin_uid(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = uid and p.role = 'admin'
  );
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

-- 2) Replace recursive policies on profiles/orders with helper functions
drop policy if exists "Admins read all profiles" on public.profiles;
create policy "Admins read all profiles"
  on public.profiles for select
  using (public.is_admin());

drop policy if exists "Admins read all orders" on public.orders;
create policy "Admins read all orders"
  on public.orders for select
  using (public.is_admin());

drop policy if exists "Admins update orders" on public.orders;
create policy "Admins update orders"
  on public.orders for update
  using (public.is_admin());

-- 3) Ensure proof url column exists for order flow
alter table public.orders add column if not exists proof_url text;

-- 4) Product CMS override table
create table if not exists public.product_overrides (
  product_id text primary key,
  name text,
  description text,
  price numeric,
  duration text,
  availability text check (availability in ('In Stock', 'Limited', 'Out of Stock')),
  image text,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz default now()
);

alter table public.product_overrides enable row level security;

drop policy if exists "Public can read product overrides" on public.product_overrides;
create policy "Public can read product overrides"
  on public.product_overrides for select
  using (true);

drop policy if exists "Admins upsert product overrides" on public.product_overrides;
create policy "Admins upsert product overrides"
  on public.product_overrides for insert
  with check (public.is_admin());

drop policy if exists "Admins update product overrides" on public.product_overrides;
create policy "Admins update product overrides"
  on public.product_overrides for update
  using (public.is_admin())
  with check (public.is_admin());

-- Optional: keep updated_at fresh on update
create or replace function public.touch_product_overrides_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_product_overrides_updated_at on public.product_overrides;
create trigger trg_product_overrides_updated_at
before update on public.product_overrides
for each row execute procedure public.touch_product_overrides_updated_at();
