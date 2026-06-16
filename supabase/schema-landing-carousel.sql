-- Landing carousel: admin picks which products appear on the landing page.
-- Run AFTER schema-shop-products.sql (needs shop_products + is_admin_uid).
-- Safe to re-run.

-- Upgrade from legacy hero_carousel_items table name (if present).
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'hero_carousel_items'
  ) and not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'landing_carousel_items'
  ) then
    alter table public.hero_carousel_items rename to landing_carousel_items;
  end if;
end $$;

create table if not exists public.landing_carousel_items (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.shop_products(id) on delete cascade,
  sort_order integer not null default 0,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique (product_id)
);

create index if not exists landing_carousel_items_sort_idx
  on public.landing_carousel_items (enabled, sort_order);

alter table public.landing_carousel_items enable row level security;

drop policy if exists "Public read enabled landing carousel" on public.landing_carousel_items;
create policy "Public read enabled landing carousel"
  on public.landing_carousel_items for select
  using (enabled = true);

drop policy if exists "Admins read all landing carousel" on public.landing_carousel_items;
create policy "Admins read all landing carousel"
  on public.landing_carousel_items for select
  to authenticated
  using (public.is_admin_uid(auth.uid()));

drop policy if exists "Admins insert landing carousel" on public.landing_carousel_items;
create policy "Admins insert landing carousel"
  on public.landing_carousel_items for insert
  to authenticated
  with check (public.is_admin_uid(auth.uid()));

drop policy if exists "Admins update landing carousel" on public.landing_carousel_items;
create policy "Admins update landing carousel"
  on public.landing_carousel_items for update
  to authenticated
  using (public.is_admin_uid(auth.uid()))
  with check (public.is_admin_uid(auth.uid()));

drop policy if exists "Admins delete landing carousel" on public.landing_carousel_items;
create policy "Admins delete landing carousel"
  on public.landing_carousel_items for delete
  to authenticated
  using (public.is_admin_uid(auth.uid()));

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'landing_carousel_items'
  ) then
    alter publication supabase_realtime add table public.landing_carousel_items;
  end if;
exception when others then
  null;
end $$;
