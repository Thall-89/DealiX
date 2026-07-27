-- Apply after 20260725_initial.sql. This migration keeps the existing `data` JSONB
-- column for backwards-compatible snapshot migration while adding typed columns.

create extension if not exists pgcrypto;

do $$ begin
  create type public.build_status as enum ('Active', 'Listed', 'Sold');
exception when duplicate_object then null; end $$;
do $$ begin create type public.asset_availability as enum ('Available', 'Unavailable', 'Restricted', 'Unknown'); exception when duplicate_object then null; end $$;
do $$ begin create type public.task_status as enum ('Open', 'In Progress', 'Blocked', 'Completed'); exception when duplicate_object then null; end $$;
do $$ begin create type public.part_sale_status as enum ('Not Listed', 'Listed', 'Offer Received', 'Pending Sale', 'Sold', 'Paid', 'Refunded', 'Returned', 'Cancelled', 'Archived'); exception when duplicate_object then null; end $$;
do $$ begin create type public.marketplace_listing_status as enum ('Draft', 'Active', 'Needs Price Confirmation', 'Offer Received', 'Pending Sale', 'Sold', 'Ended', 'Paused', 'Removed'); exception when duplicate_object then null; end $$;
do $$ begin create type public.monitor_run_status as enum ('Running', 'Completed', 'Failed', 'Skipped'); exception when duplicate_object then null; end $$;

create or replace function public.set_updated_at() returns trigger language plpgsql security invoker set search_path = public as $$
begin new.updated_at = timezone('utc', now()); return new; end;
$$;

-- Account profile is one-to-one with auth.users.
alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists preferred_currency text not null default 'USD';
alter table public.profiles add column if not exists timezone text not null default 'America/New_York';
alter table public.profiles add column if not exists updated_at timestamptz not null default timezone('utc', now());
alter table public.profiles enable row level security;
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);

-- Builds and build children.
alter table public.builds add column if not exists slug text;
alter table public.builds add column if not exists name text;
alter table public.builds add column if not exists status public.build_status not null default 'Active';
alter table public.builds add column if not exists build_cost numeric(12,2) not null default 0 check (build_cost >= 0);
alter table public.builds add column if not exists listing_price numeric(12,2) check (listing_price >= 0);
alter table public.builds add column if not exists sale_price numeric(12,2) check (sale_price >= 0);
alter table public.builds add column if not exists payout numeric(12,2) check (payout >= 0);
alter table public.builds add column if not exists cpu text; alter table public.builds add column if not exists gpu text;
alter table public.builds add column if not exists motherboard text; alter table public.builds add column if not exists ram text;
alter table public.builds add column if not exists storage text; alter table public.builds add column if not exists psu text;
alter table public.builds add column if not exists case_name text; alter table public.builds add column if not exists cooling text;
alter table public.builds add column if not exists operating_system text; alter table public.builds add column if not exists notes text;
alter table public.builds add column if not exists start_date date; alter table public.builds add column if not exists completion_date date;
alter table public.builds add column if not exists listing_date date; alter table public.builds add column if not exists sale_date date;
alter table public.builds add column if not exists created_at timestamptz not null default timezone('utc', now());
alter table public.builds add column if not exists updated_at timestamptz not null default timezone('utc', now());
create unique index if not exists builds_user_slug_key on public.builds(user_id, slug) where slug is not null;
create index if not exists builds_user_status_idx on public.builds(user_id, status);

alter table public.build_parts add column if not exists build_id uuid references public.builds(id) on delete cascade;
alter table public.build_parts add column if not exists inventory_item_id uuid;
alter table public.build_parts add column if not exists part_type text not null default 'Other';
alter table public.build_parts add column if not exists name text not null default 'Unknown part';
alter table public.build_parts add column if not exists condition text; alter table public.build_parts add column if not exists serial_number text;
alter table public.build_parts add column if not exists purchase_price numeric(12,2) check (purchase_price >= 0);
alter table public.build_parts add column if not exists notes text;
alter table public.build_parts add column if not exists created_at timestamptz not null default timezone('utc', now());
alter table public.build_parts add column if not exists updated_at timestamptz not null default timezone('utc', now());
create index if not exists build_parts_build_idx on public.build_parts(user_id, build_id);

-- Physical inventory, assignments, and immutable-ish history.
alter table public.inventory_items add column if not exists slug text;
alter table public.inventory_items add column if not exists name text not null default 'Unknown asset';
alter table public.inventory_items add column if not exists category text not null default 'Other';
alter table public.inventory_items add column if not exists brand_model text;
alter table public.inventory_items add column if not exists purchase_cost numeric(12,2) not null default 0 check (purchase_cost >= 0);
alter table public.inventory_items add column if not exists allocated_cost numeric(12,2) check (allocated_cost >= 0);
alter table public.inventory_items add column if not exists estimated_resale_value numeric(12,2) check (estimated_resale_value >= 0);
alter table public.inventory_items add column if not exists condition text; alter table public.inventory_items add column if not exists testing_status text;
alter table public.inventory_items add column if not exists current_status text not null default 'Available';
alter table public.inventory_items add column if not exists availability public.asset_availability not null default 'Available';
alter table public.inventory_items add column if not exists storage_location text; alter table public.inventory_items add column if not exists location_note text;
alter table public.inventory_items add column if not exists serial_number text; alter table public.inventory_items add column if not exists seller text;
alter table public.inventory_items add column if not exists purchase_date date; alter table public.inventory_items add column if not exists warranty text;
alter table public.inventory_items add column if not exists assigned_build_id uuid references public.builds(id) on delete set null;
alter table public.inventory_items add column if not exists personal_pc boolean not null default false;
alter table public.inventory_items add column if not exists quantity integer not null default 1 check (quantity > 0);
alter table public.inventory_items add column if not exists notes text;
alter table public.inventory_items add column if not exists created_at timestamptz not null default timezone('utc', now());
alter table public.inventory_items add column if not exists updated_at timestamptz not null default timezone('utc', now());
create unique index if not exists inventory_user_slug_key on public.inventory_items(user_id, slug) where slug is not null;
create index if not exists inventory_user_build_idx on public.inventory_items(user_id, assigned_build_id);
create index if not exists inventory_user_availability_idx on public.inventory_items(user_id, availability);
create unique index if not exists build_parts_one_asset_assignment on public.build_parts(user_id, inventory_item_id) where inventory_item_id is not null;

alter table public.asset_history add column if not exists inventory_item_id uuid references public.inventory_items(id) on delete cascade;
alter table public.asset_history add column if not exists action text not null default 'Created';
alter table public.asset_history add column if not exists note text; alter table public.asset_history add column if not exists occurred_at timestamptz not null default timezone('utc', now());
alter table public.asset_history add column if not exists created_at timestamptz not null default timezone('utc', now());
alter table public.asset_history add column if not exists updated_at timestamptz not null default timezone('utc', now());
create index if not exists asset_history_inventory_idx on public.asset_history(user_id, inventory_item_id, occurred_at desc);

-- Work, testing, and sales.
alter table public.tasks add column if not exists build_id uuid references public.builds(id) on delete cascade;
alter table public.tasks add column if not exists title text not null default 'Untitled task';
alter table public.tasks add column if not exists priority text not null default 'Medium' check (priority in ('High','Medium','Low'));
alter table public.tasks add column if not exists status public.task_status not null default 'Open';
alter table public.tasks add column if not exists due_date date; alter table public.tasks add column if not exists completed boolean not null default false;
alter table public.tasks add column if not exists notes text; alter table public.tasks add column if not exists created_at timestamptz not null default timezone('utc', now()); alter table public.tasks add column if not exists updated_at timestamptz not null default timezone('utc', now());
create index if not exists tasks_user_build_status_idx on public.tasks(user_id, build_id, status);

alter table public.testing_records add column if not exists build_id uuid references public.builds(id) on delete cascade;
alter table public.testing_records add column if not exists checklist jsonb not null default '[]'::jsonb;
alter table public.testing_records add column if not exists notes text; alter table public.testing_records add column if not exists cpu_temp text; alter table public.testing_records add column if not exists gpu_temp text;
alter table public.testing_records add column if not exists benchmark text; alter table public.testing_records add column if not exists failed_part text;
alter table public.testing_records add column if not exists create_repair_task boolean not null default true;
alter table public.testing_records add column if not exists created_at timestamptz not null default timezone('utc', now()); alter table public.testing_records add column if not exists updated_at timestamptz not null default timezone('utc', now());
create unique index if not exists testing_records_user_build_key on public.testing_records(user_id, build_id);

alter table public.marketplace_listings add column if not exists build_id uuid references public.builds(id) on delete cascade;
alter table public.marketplace_listings add column if not exists marketplace text not null default 'Unknown';
alter table public.marketplace_listings add column if not exists title text not null default 'Untitled listing';
alter table public.marketplace_listings add column if not exists url text check (url is null or url ~* '^https?://');
alter table public.marketplace_listings add column if not exists price numeric(12,2) check (price >= 0);
alter table public.marketplace_listings add column if not exists status public.marketplace_listing_status not null default 'Draft';
alter table public.marketplace_listings add column if not exists estimated_fee numeric(12,2) check (estimated_fee >= 0);
alter table public.marketplace_listings add column if not exists seller_shipping numeric(12,2) check (seller_shipping >= 0);
alter table public.marketplace_listings add column if not exists metrics jsonb not null default '{}'::jsonb;
alter table public.marketplace_listings add column if not exists notes text; alter table public.marketplace_listings add column if not exists created_at timestamptz not null default timezone('utc', now()); alter table public.marketplace_listings add column if not exists updated_at timestamptz not null default timezone('utc', now());
create index if not exists listings_user_build_status_idx on public.marketplace_listings(user_id, build_id, status);

alter table public.sales add column if not exists build_id uuid references public.builds(id) on delete restrict;
alter table public.sales add column if not exists marketplace_listing_id uuid references public.marketplace_listings(id) on delete set null;
alter table public.sales add column if not exists gross_sale_price numeric(12,2) not null check (gross_sale_price >= 0);
alter table public.sales add column if not exists marketplace_fees numeric(12,2) not null default 0 check (marketplace_fees >= 0);
alter table public.sales add column if not exists shipping_cost numeric(12,2) not null default 0 check (shipping_cost >= 0);
alter table public.sales add column if not exists other_expenses numeric(12,2) not null default 0 check (other_expenses >= 0);
alter table public.sales add column if not exists payout numeric(12,2) check (payout >= 0);
alter table public.sales add column if not exists payout_confirmed boolean not null default false;
alter table public.sales add column if not exists sold_at date; alter table public.sales add column if not exists notes text;
alter table public.sales add column if not exists created_at timestamptz not null default timezone('utc', now()); alter table public.sales add column if not exists updated_at timestamptz not null default timezone('utc', now());
create index if not exists sales_user_build_idx on public.sales(user_id, build_id, sold_at desc);

-- Acquisition, allocations, and part sales keep cash recovery separate from allocation.
alter table public.buy_vs_part_out_analyses add column if not exists title text not null default 'Untitled analysis'; alter table public.buy_vs_part_out_analyses add column if not exists marketplace text;
alter table public.buy_vs_part_out_analyses add column if not exists asking_price numeric(12,2) check (asking_price >= 0); alter table public.buy_vs_part_out_analyses add column if not exists shipping numeric(12,2) check (shipping >= 0);
alter table public.buy_vs_part_out_analyses add column if not exists tax numeric(12,2) check (tax >= 0); alter table public.buy_vs_part_out_analyses add column if not exists buyer_fees numeric(12,2) check (buyer_fees >= 0);
alter table public.buy_vs_part_out_analyses add column if not exists travel_cost numeric(12,2) check (travel_cost >= 0); alter table public.buy_vs_part_out_analyses add column if not exists repair_cost numeric(12,2) check (repair_cost >= 0);
alter table public.buy_vs_part_out_analyses add column if not exists components jsonb not null default '[]'::jsonb; alter table public.buy_vs_part_out_analyses add column if not exists status text not null default 'Analysis Only';
alter table public.buy_vs_part_out_analyses add column if not exists created_at timestamptz not null default timezone('utc', now()); alter table public.buy_vs_part_out_analyses add column if not exists updated_at timestamptz not null default timezone('utc', now());

alter table public.source_transactions add column if not exists analysis_id uuid references public.buy_vs_part_out_analyses(id) on delete set null;
alter table public.source_transactions add column if not exists title text not null default 'Untitled source'; alter table public.source_transactions add column if not exists marketplace text;
alter table public.source_transactions add column if not exists acquisition_cost numeric(12,2) not null default 0 check (acquisition_cost >= 0);
alter table public.source_transactions add column if not exists purchase_date date; alter table public.source_transactions add column if not exists seller text;
alter table public.source_transactions add column if not exists listing_url text check (listing_url is null or listing_url ~* '^https?://'); alter table public.source_transactions add column if not exists notes text;
alter table public.source_transactions add column if not exists allocation_method text; alter table public.source_transactions add column if not exists conversion_date date;
alter table public.source_transactions add column if not exists created_at timestamptz not null default timezone('utc', now()); alter table public.source_transactions add column if not exists updated_at timestamptz not null default timezone('utc', now());

alter table public.cost_allocations add column if not exists source_transaction_id uuid references public.source_transactions(id) on delete cascade;
alter table public.cost_allocations add column if not exists inventory_item_id uuid references public.inventory_items(id) on delete restrict;
alter table public.cost_allocations add column if not exists allocated_cost numeric(12,2) not null check (allocated_cost >= 0);
alter table public.cost_allocations add column if not exists created_at timestamptz not null default timezone('utc', now()); alter table public.cost_allocations add column if not exists updated_at timestamptz not null default timezone('utc', now());
create unique index if not exists cost_allocations_transaction_item_key on public.cost_allocations(user_id, source_transaction_id, inventory_item_id);

alter table public.part_sales add column if not exists inventory_item_id uuid references public.inventory_items(id) on delete restrict;
alter table public.part_sales add column if not exists marketplace text not null default 'Unknown'; alter table public.part_sales add column if not exists accepted_sale_price numeric(12,2) check (accepted_sale_price >= 0);
alter table public.part_sales add column if not exists selling_fee numeric(12,2) not null default 0 check (selling_fee >= 0); alter table public.part_sales add column if not exists shipping numeric(12,2) not null default 0 check (shipping >= 0);
alter table public.part_sales add column if not exists other_expenses numeric(12,2) not null default 0 check (other_expenses >= 0); alter table public.part_sales add column if not exists payout numeric(12,2) check (payout >= 0);
alter table public.part_sales add column if not exists payout_confirmed boolean not null default false; alter table public.part_sales add column if not exists status public.part_sale_status not null default 'Not Listed';
alter table public.part_sales add column if not exists sale_date date; alter table public.part_sales add column if not exists return_status text not null default 'Not Returned'; alter table public.part_sales add column if not exists refund_amount numeric(12,2) check (refund_amount >= 0);
alter table public.part_sales add column if not exists notes text; alter table public.part_sales add column if not exists created_at timestamptz not null default timezone('utc', now()); alter table public.part_sales add column if not exists updated_at timestamptz not null default timezone('utc', now());
create unique index if not exists part_sales_one_active_sale_per_asset on public.part_sales(user_id, inventory_item_id) where status not in ('Cancelled', 'Archived');

create or replace function public.enforce_inventory_asset_state() returns trigger language plpgsql security invoker set search_path = public as $$
begin
  if new.personal_pc then new.availability := 'Unavailable'; new.assigned_build_id := null; end if;
  if new.current_status = 'Sold' then new.availability := 'Unavailable'; new.assigned_build_id := null; end if;
  return new;
end;
$$;
drop trigger if exists enforce_inventory_asset_state on public.inventory_items;
create trigger enforce_inventory_asset_state before insert or update on public.inventory_items for each row execute function public.enforce_inventory_asset_state();

create or replace function public.enforce_allocation_total() returns trigger language plpgsql security invoker set search_path = public as $$
declare transaction_cost numeric(12,2); allocation_total numeric(12,2); transaction_id uuid;
begin
  transaction_id := case when tg_op = 'DELETE' then old.source_transaction_id else new.source_transaction_id end;
  select acquisition_cost into transaction_cost from public.source_transactions where id = transaction_id;
  select coalesce(sum(allocated_cost), 0) into allocation_total from public.cost_allocations where source_transaction_id = transaction_id;
  if allocation_total > transaction_cost then raise exception 'Allocations (%) exceed acquisition cost (%)', allocation_total, transaction_cost using errcode = '23514'; end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
drop trigger if exists enforce_allocation_total on public.cost_allocations;
create constraint trigger enforce_allocation_total after insert or update or delete on public.cost_allocations deferrable initially deferred for each row execute function public.enforce_allocation_total();

-- Deal intelligence.
alter table public.saved_searches add column if not exists name text not null default 'Untitled search'; alter table public.saved_searches add column if not exists category text not null default 'Other';
alter table public.saved_searches add column if not exists terms text not null default ''; alter table public.saved_searches add column if not exists marketplace text not null default 'All';
alter table public.saved_searches add column if not exists filters jsonb not null default '{}'::jsonb; alter table public.saved_searches add column if not exists target_price numeric(12,2) check (target_price >= 0);
alter table public.saved_searches add column if not exists active boolean not null default true; alter table public.saved_searches add column if not exists last_checked timestamptz; alter table public.saved_searches add column if not exists last_result_count integer not null default 0;
alter table public.saved_searches add column if not exists created_at timestamptz not null default timezone('utc', now()); alter table public.saved_searches add column if not exists updated_at timestamptz not null default timezone('utc', now());
create index if not exists saved_searches_active_idx on public.saved_searches(user_id, active) where active;

alter table public.marketplace_results add column if not exists external_id text; alter table public.marketplace_results add column if not exists marketplace text not null default 'Manual';
alter table public.marketplace_results add column if not exists normalized_url text; alter table public.marketplace_results add column if not exists title text not null default 'Untitled result';
alter table public.marketplace_results add column if not exists category text; alter table public.marketplace_results add column if not exists source_type text not null default 'Manual';
alter table public.marketplace_results add column if not exists asking_price numeric(12,2) check (asking_price >= 0); alter table public.marketplace_results add column if not exists shipping numeric(12,2) check (shipping >= 0);
alter table public.marketplace_results add column if not exists estimated_tax numeric(12,2) check (estimated_tax >= 0); alter table public.marketplace_results add column if not exists seller_rating numeric(5,2) check (seller_rating between 0 and 5);
alter table public.marketplace_results add column if not exists condition text; alter table public.marketplace_results add column if not exists listing_url text check (listing_url is null or listing_url ~* '^https?://');
alter table public.marketplace_results add column if not exists raw_source jsonb not null default '{}'::jsonb; alter table public.marketplace_results add column if not exists found_at timestamptz not null default timezone('utc', now()); alter table public.marketplace_results add column if not exists last_checked timestamptz not null default timezone('utc', now());
alter table public.marketplace_results add column if not exists created_at timestamptz not null default timezone('utc', now()); alter table public.marketplace_results add column if not exists updated_at timestamptz not null default timezone('utc', now());
create unique index if not exists marketplace_results_external_key on public.marketplace_results(user_id, marketplace, external_id) where external_id is not null;
create unique index if not exists marketplace_results_url_key on public.marketplace_results(user_id, normalized_url) where normalized_url is not null;

alter table public.watchlist_items add column if not exists marketplace_result_id uuid references public.marketplace_results(id) on delete cascade;
alter table public.watchlist_items add column if not exists interested_build_id uuid references public.builds(id) on delete set null; alter table public.watchlist_items add column if not exists original_price numeric(12,2);
alter table public.watchlist_items add column if not exists current_price numeric(12,2); alter table public.watchlist_items add column if not exists lowest_observed_price numeric(12,2); alter table public.watchlist_items add column if not exists highest_observed_price numeric(12,2);
alter table public.watchlist_items add column if not exists target_price numeric(12,2); alter table public.watchlist_items add column if not exists price_changes jsonb not null default '[]'::jsonb; alter table public.watchlist_items add column if not exists score_history jsonb not null default '[]'::jsonb;
alter table public.watchlist_items add column if not exists status text not null default 'Available'; alter table public.watchlist_items add column if not exists notes text; alter table public.watchlist_items add column if not exists created_at timestamptz not null default timezone('utc', now()); alter table public.watchlist_items add column if not exists updated_at timestamptz not null default timezone('utc', now());
create unique index if not exists watchlist_result_key on public.watchlist_items(user_id, marketplace_result_id);

alter table public.deal_alerts add column if not exists marketplace_result_id uuid references public.marketplace_results(id) on delete set null; alter table public.deal_alerts add column if not exists title text not null default 'Untitled alert';
alter table public.deal_alerts add column if not exists description text not null default ''; alter table public.deal_alerts add column if not exists alert_type text not null default 'Below target'; alter table public.deal_alerts add column if not exists unread boolean not null default true;
alter table public.deal_alerts add column if not exists dismissed boolean not null default false; alter table public.deal_alerts add column if not exists fingerprint text; alter table public.deal_alerts add column if not exists score integer check (score between 0 and 100);
alter table public.deal_alerts add column if not exists qualification jsonb not null default '[]'::jsonb; alter table public.deal_alerts add column if not exists risks jsonb not null default '[]'::jsonb; alter table public.deal_alerts add column if not exists created_at timestamptz not null default timezone('utc', now()); alter table public.deal_alerts add column if not exists updated_at timestamptz not null default timezone('utc', now());
create index if not exists deal_alerts_user_unread_idx on public.deal_alerts(user_id, unread, created_at desc);

alter table public.alert_fingerprints add column if not exists fingerprint text not null default ''; alter table public.alert_fingerprints add column if not exists marketplace_result_id uuid references public.marketplace_results(id) on delete cascade; alter table public.alert_fingerprints add column if not exists last_score integer; alter table public.alert_fingerprints add column if not exists last_price numeric(12,2); alter table public.alert_fingerprints add column if not exists created_at timestamptz not null default timezone('utc', now()); alter table public.alert_fingerprints add column if not exists updated_at timestamptz not null default timezone('utc', now());
create unique index if not exists alert_fingerprints_user_fingerprint_key on public.alert_fingerprints(user_id, fingerprint);

-- Notifications, receipts, configuration, and audit trail.
alter table public.notifications add column if not exists title text not null default 'Notification'; alter table public.notifications add column if not exists description text not null default ''; alter table public.notifications add column if not exists unread boolean not null default true; alter table public.notifications add column if not exists dismissed boolean not null default false; alter table public.notifications add column if not exists created_at timestamptz not null default timezone('utc', now()); alter table public.notifications add column if not exists updated_at timestamptz not null default timezone('utc', now());
create index if not exists notifications_user_unread_idx on public.notifications(user_id, unread, created_at desc);

alter table public.receipts add column if not exists build_id uuid references public.builds(id) on delete set null; alter table public.receipts add column if not exists inventory_item_id uuid references public.inventory_items(id) on delete set null; alter table public.receipts add column if not exists source_transaction_id uuid references public.source_transactions(id) on delete set null; alter table public.receipts add column if not exists purchase_date date; alter table public.receipts add column if not exists store_name text; alter table public.receipts add column if not exists subtotal numeric(12,2) check (subtotal >= 0); alter table public.receipts add column if not exists tax numeric(12,2) check (tax >= 0); alter table public.receipts add column if not exists shipping numeric(12,2) check (shipping >= 0); alter table public.receipts add column if not exists fees numeric(12,2) check (fees >= 0); alter table public.receipts add column if not exists total numeric(12,2) check (total >= 0); alter table public.receipts add column if not exists confirmation_status text not null default 'Unconfirmed'; alter table public.receipts add column if not exists notes text; alter table public.receipts add column if not exists created_at timestamptz not null default timezone('utc', now()); alter table public.receipts add column if not exists updated_at timestamptz not null default timezone('utc', now());
create index if not exists receipts_user_purchase_idx on public.receipts(user_id, purchase_date desc);

alter table public.receipt_files add column if not exists receipt_id uuid references public.receipts(id) on delete cascade; alter table public.receipt_files add column if not exists bucket_id text not null default 'receipts'; alter table public.receipt_files add column if not exists storage_path text not null default ''; alter table public.receipt_files add column if not exists mime_type text not null default 'application/octet-stream'; alter table public.receipt_files add column if not exists byte_size bigint not null default 0 check (byte_size >= 0); alter table public.receipt_files add column if not exists created_at timestamptz not null default timezone('utc', now()); alter table public.receipt_files add column if not exists updated_at timestamptz not null default timezone('utc', now());
create unique index if not exists receipt_files_path_key on public.receipt_files(bucket_id, storage_path);

alter table public.app_settings add column if not exists settings jsonb not null default '{}'::jsonb; alter table public.app_settings add column if not exists notification_preferences jsonb not null default '{}'::jsonb; alter table public.app_settings add column if not exists tax_rate numeric(7,6) check (tax_rate between 0 and 1); alter table public.app_settings add column if not exists created_at timestamptz not null default timezone('utc', now()); alter table public.app_settings add column if not exists updated_at timestamptz not null default timezone('utc', now());

alter table public.audit_events add column if not exists action text not null default 'Unknown action'; alter table public.audit_events add column if not exists related_type text; alter table public.audit_events add column if not exists related_id uuid; alter table public.audit_events add column if not exists old_value jsonb; alter table public.audit_events add column if not exists new_value jsonb; alter table public.audit_events add column if not exists event_source text not null default 'user'; alter table public.audit_events add column if not exists occurred_at timestamptz not null default timezone('utc', now()); alter table public.audit_events add column if not exists created_at timestamptz not null default timezone('utc', now()); alter table public.audit_events add column if not exists updated_at timestamptz not null default timezone('utc', now());
create index if not exists audit_events_user_occurred_idx on public.audit_events(user_id, occurred_at desc);

alter table public.monitor_runs add column if not exists status public.monitor_run_status not null default 'Running'; alter table public.monitor_runs add column if not exists started_at timestamptz not null default timezone('utc', now()); alter table public.monitor_runs add column if not exists finished_at timestamptz; alter table public.monitor_runs add column if not exists searches_checked integer not null default 0; alter table public.monitor_runs add column if not exists results_found integer not null default 0; alter table public.monitor_runs add column if not exists alerts_created integer not null default 0; alter table public.monitor_runs add column if not exists error_message text; alter table public.monitor_runs add column if not exists created_at timestamptz not null default timezone('utc', now()); alter table public.monitor_runs add column if not exists updated_at timestamptz not null default timezone('utc', now());
create index if not exists monitor_runs_user_started_idx on public.monitor_runs(user_id, started_at desc);

-- Enforce RLS and automatic updated_at for every application table.
do $$ declare t text; begin
  foreach t in array array['builds','build_parts','inventory_items','asset_history','tasks','testing_records','marketplace_listings','sales','source_transactions','cost_allocations','part_sales','buy_vs_part_out_analyses','saved_searches','marketplace_results','watchlist_items','deal_alerts','alert_fingerprints','notifications','receipts','receipt_files','app_settings','audit_events','monitor_runs'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "own rows" on public.%I', t);
    execute format('create policy "own rows" on public.%I for all using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- Private Storage buckets and user-scoped policies. Files must use users/{auth.uid()}/... paths.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('receipts','receipts',false,10485760,array['image/jpeg','image/png','image/webp','application/pdf']),
  ('build-photos','build-photos',false,10485760,array['image/jpeg','image/png','image/webp']),
  ('sale-screenshots','sale-screenshots',false,10485760,array['image/jpeg','image/png','image/webp','application/pdf']),
  ('benchmark-screenshots','benchmark-screenshots',false,10485760,array['image/jpeg','image/png','image/webp']),
  ('listing-photos','listing-photos',false,10485760,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "dealix private object access" on storage.objects;
create policy "dealix private object access" on storage.objects for all to authenticated
using (bucket_id in ('receipts','build-photos','sale-screenshots','benchmark-screenshots','listing-photos') and (storage.foldername(name))[1] = 'users' and (storage.foldername(name))[2] = auth.uid()::text)
with check (bucket_id in ('receipts','build-photos','sale-screenshots','benchmark-screenshots','listing-photos') and (storage.foldername(name))[1] = 'users' and (storage.foldername(name))[2] = auth.uid()::text);

-- Remaining normalized children used by the build, listing, and deal-detail views.
create table if not exists public.build_templates (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  source_build_id uuid references public.builds(id) on delete set null, name text not null,
  target_cost numeric(12,2) check (target_cost >= 0), target_resale numeric(12,2) check (target_resale >= 0),
  target_profit numeric(12,2), target_roi numeric(12,4), specifications jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now())
);
create table if not exists public.build_timeline_events (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  build_id uuid not null references public.builds(id) on delete cascade, label text not null, completed boolean not null default false,
  occurred_on date, created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now())
);
create table if not exists public.build_missing_parts (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  build_id uuid not null references public.builds(id) on delete cascade, name text not null,
  priority text not null check (priority in ('High','Medium','Low')), status text not null default 'Needed', details text not null default '',
  created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now())
);
create table if not exists public.build_photos (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  build_id uuid not null references public.builds(id) on delete cascade, kind text not null, bucket_id text not null default 'build-photos',
  storage_path text not null, created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, build_id, kind)
);
create table if not exists public.listing_drafts (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  build_id uuid not null references public.builds(id) on delete cascade, marketplace text not null, title text not null, content text not null,
  created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now())
);
create table if not exists public.listing_price_history (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  marketplace_listing_id uuid not null references public.marketplace_listings(id) on delete cascade,
  price numeric(12,2) check (price >= 0), note text, recorded_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now())
);
create table if not exists public.deal_offers (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  marketplace_result_id uuid not null references public.marketplace_results(id) on delete cascade,
  asking_price numeric(12,2) check (asking_price >= 0), suggested_opening_offer numeric(12,2) check (suggested_opening_offer >= 0),
  target_purchase_price numeric(12,2) check (target_purchase_price >= 0), maximum_purchase_price numeric(12,2) check (maximum_purchase_price >= 0),
  walk_away_price numeric(12,2) check (walk_away_price >= 0), counteroffer numeric(12,2) check (counteroffer >= 0), final_accepted_price numeric(12,2) check (final_accepted_price >= 0),
  status text not null default 'Not Contacted' check (status in ('Not Contacted','Offer Planned','Offer Sent','Counter Received','Accepted','Declined','Purchased','Expired')),
  follow_up_date date, seller_response text, notes text, created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, marketplace_result_id)
);
create index if not exists build_timeline_events_build_idx on public.build_timeline_events(user_id, build_id, occurred_on);
create index if not exists build_missing_parts_build_idx on public.build_missing_parts(user_id, build_id);
create index if not exists listing_drafts_build_idx on public.listing_drafts(user_id, build_id);
create index if not exists listing_price_history_listing_idx on public.listing_price_history(user_id, marketplace_listing_id, recorded_at desc);

do $$ declare t text; begin
  foreach t in array array['build_templates','build_timeline_events','build_missing_parts','build_photos','listing_drafts','listing_price_history','deal_offers'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "own rows" on public.%I', t);
    execute format('create policy "own rows" on public.%I for all using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;
