-- Apply after 20260727_security_hardening.sql. Browser users may read, but never
-- create, alter, or erase their audit history.
drop policy if exists "own rows" on public.audit_events;
drop policy if exists "own audit events" on public.audit_events;
create policy "own audit events" on public.audit_events for select to authenticated using ((select auth.uid()) = user_id);

create or replace function public.audit_app_settings_change() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.audit_events (user_id, action, related_type, related_id, new_value, event_source)
  values (new.user_id, case when tg_op = 'INSERT' then 'Cloud snapshot created' else 'Cloud snapshot updated' end, 'app_settings', new.id, jsonb_build_object('snapshot_changed', true), 'database');
  return new;
end;
$$;
revoke all on function public.audit_app_settings_change() from public;
drop trigger if exists audit_app_settings_change on public.app_settings;
create trigger audit_app_settings_change after insert or update on public.app_settings for each row execute function public.audit_app_settings_change();
