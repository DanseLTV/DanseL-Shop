-- Per-product capital (cost) for admin finance — run in Supabase SQL Editor
-- Safe to re-run. Revenue is computed from orders in the app; capital_cost is edited in Admin → Overview.
-- Requires: public.shop_products (schema-shop-products.sql)

alter table public.shop_products
  add column if not exists capital_cost numeric not null default 0 check (capital_cost >= 0);

comment on column public.shop_products.capital_cost is
  'Admin-set unit cost per product; used with paid/delivered orders to calculate net profit.';

-- Optional: remove legacy single-capital table if you created it earlier
-- drop table if exists public.shop_finance_settings;
