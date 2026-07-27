create table if not exists public.recon_scan_locks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  locked_until timestamptz not null,
  updated_at timestamptz not null default timezone('utc', now())
);
alter table public.recon_scan_locks enable row level security;

create or replace function public.acquire_recon_scan_lock(target_user_id uuid, lock_seconds integer default 240)
returns boolean language plpgsql security definer set search_path = public as $$
declare acquired boolean;
begin
  if lock_seconds < 30 or lock_seconds > 600 then raise exception 'Invalid lock duration'; end if;
  insert into public.recon_scan_locks (user_id, locked_until)
  values (target_user_id, timezone('utc', now()) + make_interval(secs => lock_seconds))
  on conflict (user_id) do update set locked_until = excluded.locked_until, updated_at = timezone('utc', now())
  where public.recon_scan_locks.locked_until <= timezone('utc', now())
  returning true into acquired;
  return coalesce(acquired, false);
end;
$$;
revoke all on function public.acquire_recon_scan_lock(uuid, integer) from public;
