-- Apply after 20260726_complete_schema.sql. Explicitly deny anonymous access and
-- scope all browser policies to authenticated owners only.

revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
revoke execute on all functions in schema public from public;
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant execute on function public.set_updated_at() to authenticated;

do $$ declare t text; begin
  foreach t in array array['builds','build_parts','inventory_items','asset_history','tasks','testing_records','marketplace_listings','sales','source_transactions','cost_allocations','part_sales','buy_vs_part_out_analyses','saved_searches','marketplace_results','watchlist_items','deal_alerts','alert_fingerprints','notifications','receipts','receipt_files','app_settings','audit_events','monitor_runs','build_templates','build_timeline_events','build_missing_parts','build_photos','listing_drafts','listing_price_history','deal_offers'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "own rows" on public.%I', t);
    execute format('create policy "own rows" on public.%I for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);
  end loop;
end $$;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for all to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, user_id, display_name) values (new.id, new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))) on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public;
grant execute on function public.handle_new_user() to supabase_auth_admin;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- Storage is private. Authenticated users may only access their own users/{uuid}/ paths.
revoke all on storage.objects from anon;
drop policy if exists "dealix private object access" on storage.objects;
create policy "dealix private object access" on storage.objects for all to authenticated
using (bucket_id in ('receipts','build-photos','sale-screenshots','benchmark-screenshots','listing-photos') and (storage.foldername(name))[1] = 'users' and (storage.foldername(name))[2] = (select auth.uid()::text))
with check (bucket_id in ('receipts','build-photos','sale-screenshots','benchmark-screenshots','listing-photos') and (storage.foldername(name))[1] = 'users' and (storage.foldername(name))[2] = (select auth.uid()::text));
