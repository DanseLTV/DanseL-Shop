-- Run this in Supabase Dashboard → SQL Editor
-- https://supabase.com/dashboard

-- Profiles (linked to auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  phone text not null,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

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

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Customer'),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    'customer'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Orders
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

alter table public.orders enable row level security;

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

-- Make yourself admin (run AFTER you sign up — replace email):
-- update public.profiles
-- set role = 'admin'
-- where id = (select id from auth.users where email = 'danseltvshop@gmail.com');
