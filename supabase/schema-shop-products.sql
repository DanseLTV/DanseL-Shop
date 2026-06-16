-- Full product catalog in Supabase — admin can add, edit, delete, hide products.
-- Run AFTER schema-transaction-cms-fix.sql (needs is_admin_uid).
-- Safe to re-run.

create table if not exists public.shop_products (
  id text primary key,
  name text not null,
  category text not null,
  description text not null default '',
  price numeric not null default 0 check (price >= 0),
  capital_cost numeric not null default 0 check (capital_cost >= 0),
  duration text not null default '30 Days',
  availability text not null default 'In Stock'
    check (availability in ('In Stock', 'Limited', 'Out of Stock')),
  featured boolean not null default false,
  badge text,
  features jsonb not null default '[]'::jsonb,
  image_gradient text not null default 'from-violet-700 via-purple-700 to-indigo-800',
  image text,
  image_fit text not null default 'cover' check (image_fit in ('logo', 'cover')),
  enabled boolean not null default true,
  sort_order integer not null default 0,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shop_products_enabled_sort_idx
  on public.shop_products (enabled, sort_order, name);

alter table public.shop_products enable row level security;

-- Customers see enabled products only
drop policy if exists "Public read enabled shop products" on public.shop_products;
create policy "Public read enabled shop products"
  on public.shop_products for select
  using (enabled = true);

-- Admins see and manage everything
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

create or replace function public.touch_shop_products_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_shop_products_updated_at on public.shop_products;
create trigger trg_shop_products_updated_at
before update on public.shop_products
for each row execute procedure public.touch_shop_products_updated_at();

-- Realtime for live shop updates
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'shop_products'
  ) then
    alter publication supabase_realtime add table public.shop_products;
  end if;
end $$;

alter table public.shop_products replica identity full;

-- Optional: import default catalog from app admin panel, or run seed via app.
-- After first import, shop_products becomes the live source for the customer site.
