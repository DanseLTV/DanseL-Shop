-- Optional quantity column for multi-item cart checkout
alter table public.orders
  add column if not exists quantity integer not null default 1 check (quantity > 0);

-- Extend create_order to accept quantity (amount should be unit price × quantity from app)
create or replace function public.create_order(
  p_product_id text,
  p_product_name text,
  p_amount numeric,
  p_payment_method text,
  p_notes text default null,
  p_quantity integer default 1
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
  safe_qty integer;
begin
  perform public.ensure_my_profile();

  safe_qty := greatest(coalesce(p_quantity, 1), 1);

  insert into public.orders (
    user_id,
    product_id,
    product_name,
    amount,
    payment_method,
    notes,
    status,
    quantity
  )
  values (
    auth.uid(),
    p_product_id,
    p_product_name,
    p_amount,
    p_payment_method,
    p_notes,
    'pending',
    safe_qty
  )
  returning id into new_id;

  return new_id;
end;
$$;

grant execute on function public.create_order(text, text, numeric, text, text, integer) to authenticated;
