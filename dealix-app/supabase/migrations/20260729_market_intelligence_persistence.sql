-- Stable client keys let DealiX move browser-created records into normalized,
-- user-owned Market Intelligence tables without trusting browser row IDs.
alter table public.saved_searches add column if not exists client_key text;
alter table public.marketplace_results add column if not exists client_key text;
alter table public.watchlist_items add column if not exists client_key text;
alter table public.deal_alerts add column if not exists client_key text;
alter table public.alert_fingerprints add column if not exists client_key text;
alter table public.notifications add column if not exists client_key text;
alter table public.monitor_runs add column if not exists client_key text;

do $$ declare table_name text; begin
  foreach table_name in array array['saved_searches','marketplace_results','watchlist_items','deal_alerts','alert_fingerprints','notifications','monitor_runs'] loop
    execute format('create unique index if not exists %I on public.%I(user_id, client_key) where client_key is not null', table_name || '_user_client_key_idx', table_name);
  end loop;
end $$;

-- The already-enabled owner policies remain the only browser access path. The
-- server sync derives user_id from the verified session and never accepts it.
