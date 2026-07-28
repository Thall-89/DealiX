-- Global product and retailer offer catalog. Product data is shared reference
-- data; user workspaces remain isolated in existing user-owned tables.
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  external_key text not null unique,
  manufacturer text not null,
  name text not null,
  category text not null,
  image_url text,
  specifications jsonb not null default '{}'::jsonb,
  compatibility jsonb not null default '{}'::jsonb,
  msrp numeric(12,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_category_length check (char_length(category) between 2 and 80),
  constraint products_name_length check (char_length(name) between 2 and 240),
  constraint products_msrp_nonnegative check (msrp is null or msrp >= 0)
);

create table if not exists public.retailers (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null unique,
  logo_url text,
  enabled boolean not null default false,
  affiliate_enabled boolean not null default false,
  priority smallint not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint retailers_key_format check (key ~ '^[a-z0-9-]{2,64}$')
);

create table if not exists public.retailer_offers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  retailer_id uuid not null references public.retailers(id) on delete cascade,
  external_offer_id text not null,
  price numeric(12,2) not null check (price >= 0),
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  availability text not null default 'Unknown',
  shipping numeric(12,2) check (shipping is null or shipping >= 0),
  affiliate_url text,
  rating numeric(3,2) check (rating is null or rating between 0 and 5),
  review_count integer check (review_count is null or review_count >= 0),
  last_updated timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (retailer_id, external_offer_id)
);

create index if not exists products_category_name_idx on public.products(category, name);
create index if not exists retailer_offers_product_price_idx on public.retailer_offers(product_id, price);
create index if not exists retailer_offers_retailer_updated_idx on public.retailer_offers(retailer_id, last_updated desc);

alter table public.products enable row level security;
alter table public.retailers enable row level security;
alter table public.retailer_offers enable row level security;

drop policy if exists "authenticated users can read products" on public.products;
drop policy if exists "authenticated users can read retailers" on public.retailers;
drop policy if exists "authenticated users can read retailer offers" on public.retailer_offers;
create policy "authenticated users can read products" on public.products for select to authenticated using (true);
create policy "authenticated users can read retailers" on public.retailers for select to authenticated using (true);
create policy "authenticated users can read retailer offers" on public.retailer_offers for select to authenticated using (true);

insert into public.retailers (key, name, enabled, priority) values
  ('ebay', 'eBay', true, 10),
  ('amazon', 'Amazon', false, 20),
  ('best-buy', 'Best Buy', false, 30),
  ('micro-center', 'Micro Center', false, 40),
  ('newegg', 'Newegg', false, 50),
  ('bh-photo', 'B&H Photo', false, 60),
  ('adorama', 'Adorama', false, 70),
  ('walmart', 'Walmart', false, 80)
on conflict (key) do update set name = excluded.name, priority = excluded.priority, updated_at = now();
