create table if not exists public.recon_price_observations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  marketplace_result_id uuid references public.marketplace_results(id) on delete cascade,
  provider_id text not null,
  external_listing_id text not null,
  observed_price numeric(12,2) not null check (observed_price >= 0),
  shipping numeric(12,2) check (shipping >= 0),
  seller_name text,
  observed_at timestamptz not null default timezone('utc', now())
);
create index if not exists recon_price_observations_listing_idx on public.recon_price_observations(user_id, provider_id, external_listing_id, observed_at desc);
alter table public.recon_price_observations enable row level security;
drop policy if exists "own rows" on public.recon_price_observations;
create policy "own rows" on public.recon_price_observations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
