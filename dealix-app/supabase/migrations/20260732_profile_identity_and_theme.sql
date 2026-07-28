-- Profile identity and preferences for the public beta.
-- Safe to run after the existing profile/security migrations.

alter table public.profiles
  add column if not exists username text,
  add column if not exists avatar_url text,
  add column if not exists bio text,
  add column if not exists theme text not null default 'dark',
  add column if not exists has_logged_in_before boolean not null default false;

-- Existing accounts receive a stable, private username. New accounts use their
-- email prefix through the auth trigger below.
update public.profiles
set username = left(
  coalesce(nullif(lower(regexp_replace(display_name, '[^a-z0-9_]+', '', 'g')), ''), 'user')
  || '_' || left(id::text, 6),
  32
)
where username is null or btrim(username) = '';

alter table public.profiles
  alter column username set not null;

alter table public.profiles
  drop constraint if exists profiles_username_format,
  drop constraint if exists profiles_username_unique,
  drop constraint if exists profiles_display_name_length,
  drop constraint if exists profiles_bio_length,
  drop constraint if exists profiles_avatar_url_length,
  drop constraint if exists profiles_theme_check;

alter table public.profiles
  add constraint profiles_username_format check (username ~ '^[a-z0-9_]{3,32}$'),
  add constraint profiles_username_unique unique (username),
  add constraint profiles_display_name_length check (display_name is null or char_length(display_name) between 1 and 80),
  add constraint profiles_bio_length check (bio is null or char_length(bio) <= 500),
  add constraint profiles_avatar_url_length check (avatar_url is null or char_length(avatar_url) <= 2048),
  add constraint profiles_theme_check check (theme in ('dark', 'light'));

create or replace function public.dealix_username_seed(value text)
returns text
language sql
immutable
set search_path = public
as $$
  select left(coalesce(nullif(lower(regexp_replace(coalesce(value, ''), '[^a-z0-9_]+', '', 'g')), ''), 'user'), 32)
$$;

create or replace function public.dealix_unique_username(value text, account_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  base text := public.dealix_username_seed(value);
  candidate text;
  suffix integer := 0;
begin
  if char_length(base) < 3 then base := rpad(base, 3, 'user'); end if;
  loop
    candidate := case when suffix = 0 then base else left(base, 32 - char_length(suffix::text) - 1) || '_' || suffix::text end;
    exit when not exists (select 1 from public.profiles where username = candidate and id <> account_id);
    suffix := suffix + 1;
  end loop;
  return candidate;
end;
$$;

revoke all on function public.dealix_unique_username(text, uuid) from public;
grant execute on function public.dealix_unique_username(text, uuid) to supabase_auth_admin;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  raw_display_name text := coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1));
  raw_username text := coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1));
begin
  insert into public.profiles (id, user_id, username, display_name)
  values (new.id, new.id, public.dealix_unique_username(raw_username, new.id), raw_display_name)
  on conflict (id) do update set
    username = coalesce(public.profiles.username, excluded.username),
    display_name = coalesce(public.profiles.display_name, excluded.display_name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();
