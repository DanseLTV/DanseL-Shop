-- Enable realtime so the shop, orders, and chat update live without reloading.
-- Safe to re-run.

do $$
begin
  -- Product CMS edits → customer cards update live
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'product_overrides'
  ) then
    alter publication supabase_realtime add table public.product_overrides;
  end if;

  -- Order status/proof changes → My Orders + Admin update live
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;

  -- Messages (in case schema-messages.sql wasn't run)
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'order_messages'
  ) then
    alter publication supabase_realtime add table public.order_messages;
  end if;
end $$;

-- Ensure full row data is sent on UPDATE (needed for status/proof realtime payloads)
alter table public.orders replica identity full;
alter table public.product_overrides replica identity full;
