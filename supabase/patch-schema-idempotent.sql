-- Safe to re-run if schema.sql failed with "policy already exists"
-- Run once in Supabase SQL Editor, then continue the checklist (messages, order-proof, etc.)

-- Profiles policies
drop policy if exists "Users read own profile" on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;
drop policy if exists "Admins read all profiles" on public.profiles;

create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins read all profiles"
  on public.profiles for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Orders policies
drop policy if exists "Users insert own orders" on public.orders;
drop policy if exists "Users read own orders" on public.orders;
drop policy if exists "Admins read all orders" on public.orders;
drop policy if exists "Admins update orders" on public.orders;

create policy "Users insert own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Users read own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Admins read all orders"
  on public.orders for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Admins update orders"
  on public.orders for update
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Ensure tables exist (no-op if already created)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  phone text not null,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_id text not null,
  product_name text not null,
  amount numeric not null,
  payment_method text not null,
  notes text,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'delivered', 'cancelled')),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.orders enable row level security;
