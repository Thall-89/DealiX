-- Extend the normalized product catalog after 20260733_product_pricing_catalog.sql.
alter table public.retailers add column if not exists retailer_type text not null default 'Retail'
  check (retailer_type in ('Retail', 'Marketplace', 'Distributor'));

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade,
  url text not null, is_primary boolean not null default false, source text not null, last_updated timestamptz not null default now(),
  unique (product_id, url)
);
create unique index if not exists product_images_one_primary_idx on public.product_images(product_id) where is_primary;

create table if not exists public.product_benchmarks (
  product_id uuid primary key references public.products(id) on delete cascade,
  benchmark_score numeric(10,2), gaming_score numeric(10,2), productivity_score numeric(10,2), value_score numeric(10,2),
  source text not null, updated_at timestamptz not null default now()
);

create table if not exists public.marketplace_offers (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade,
  marketplace text not null, external_offer_id text not null, title text not null, price numeric(12,2) not null check (price >= 0),
  shipping numeric(12,2) check (shipping is null or shipping >= 0), condition text, availability text not null default 'Unknown',
  listing_url text, seller_rating numeric(3,2) check (seller_rating is null or seller_rating between 0 and 5),
  image_url text, last_updated timestamptz not null default now(), created_at timestamptz not null default now(),
  unique (marketplace, external_offer_id)
);

create table if not exists public.price_history (
  id uuid primary key default gen_random_uuid(), offer_id uuid not null references public.retailer_offers(id) on delete cascade,
  price numeric(12,2) not null check (price >= 0), shipping numeric(12,2) check (shipping is null or shipping >= 0),
  recorded_at timestamptz not null default now()
);
create index if not exists price_history_offer_recorded_idx on public.price_history(offer_id, recorded_at desc);

create table if not exists public.product_providers (
  id uuid primary key default gen_random_uuid(), key text not null unique, name text not null, provider_type text not null,
  enabled boolean not null default false, configured boolean not null default false, last_success_at timestamptz, last_error text,
  last_sync_product_count integer not null default 0, average_response_ms integer, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.product_provider_runs (
  id uuid primary key default gen_random_uuid(), provider_id uuid not null references public.product_providers(id) on delete cascade,
  status text not null check (status in ('Running', 'Completed', 'Failed', 'Skipped')), products_seen integer not null default 0,
  offers_upserted integer not null default 0, duration_ms integer, error_message text, started_at timestamptz not null default now(), completed_at timestamptz
);

create index if not exists marketplace_offers_product_price_idx on public.marketplace_offers(product_id, price);
create index if not exists provider_runs_provider_started_idx on public.product_provider_runs(provider_id, started_at desc);

alter table public.product_images enable row level security;
alter table public.product_benchmarks enable row level security;
alter table public.marketplace_offers enable row level security;
alter table public.price_history enable row level security;
alter table public.product_providers enable row level security;
alter table public.product_provider_runs enable row level security;
create policy "authenticated users can read product images" on public.product_images for select to authenticated using (true);
create policy "authenticated users can read product benchmarks" on public.product_benchmarks for select to authenticated using (true);
create policy "authenticated users can read marketplace offers" on public.marketplace_offers for select to authenticated using (true);
create policy "authenticated users can read price history" on public.price_history for select to authenticated using (true);
create policy "authenticated users can read product providers" on public.product_providers for select to authenticated using (true);
create policy "authenticated users can read product provider runs" on public.product_provider_runs for select to authenticated using (true);

insert into public.product_providers (key, name, provider_type) values
  ('ebay-browse', 'eBay Browse API', 'Marketplace'), ('amazon-pa-api', 'Amazon Product Advertising API', 'Retail'),
  ('best-buy', 'Best Buy Product API', 'Retail'), ('rainforest', 'Rainforest API', 'Aggregator'),
  ('serpapi', 'SerpApi', 'Aggregator'), ('dataforseo', 'DataForSEO', 'Aggregator')
on conflict (key) do update set name = excluded.name, provider_type = excluded.provider_type, updated_at = now();
