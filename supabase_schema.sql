-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (
  exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  )
);

-- Create address_book table
create table public.address_book (
  id uuid default gen_random_uuid() primary key,
  company_name text not null,
  department text,
  postal_code text,
  address text,
  last_name text not null,
  first_name text,
  email text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users null
);

-- Enable RLS for address_book
alter table public.address_book enable row level security;
create policy "Users can view all addresses" on public.address_book for select using (true);
create policy "Users can insert addresses" on public.address_book for insert with check (auth.uid() is not null);
create policy "Users can update addresses" on public.address_book for update using (auth.uid() is not null);

-- Create products table
create table public.products (
  id uuid default gen_random_uuid() primary key,
  md_code text not null unique,
  product_name text not null,
  specification text,
  unit text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for products
alter table public.products enable row level security;
create policy "Users can view all products" on public.products for select using (true);
create policy "Admins can insert products" on public.products for insert with check (
  exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  )
);

-- Create shipping_data table
create table public.shipping_data (
  id uuid default gen_random_uuid() primary key,
  address_id uuid references public.address_book not null,
  products jsonb not null, -- Array of { product_id, quantity }
  delivery_date date not null,
  delivery_time text,
  status text default 'draft' check (status in ('draft', 'requested', 'notified', 'followed_up')),
  created_by uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for shipping_data
alter table public.shipping_data enable row level security;
create policy "Users can view all shipping data" on public.shipping_data for select using (auth.uid() is not null);
create policy "Users can insert shipping data" on public.shipping_data for insert with check (auth.uid() = created_by);
create policy "Users can update own shipping data" on public.shipping_data for update using (auth.uid() = created_by);

-- Function to handle new user signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile after signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
