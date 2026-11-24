-- Muse – upload limits & hardening. Run once in the Supabase SQL editor (after schema.sql).
-- Enforced in the database, so it also applies to anyone calling the Supabase API directly.

-- 1. The limit lives in one place --------------------------------------------
create or replace function public.upload_limit_per_hour()
returns integer language sql immutable as $$ select 10 $$;

-- 2. Every upload is logged (deleting a file does NOT give the quota back) -----
create table if not exists public.upload_log (
  id         bigint generated always as identity primary key,
  user_id    uuid not null,
  created_at timestamptz not null default now()
);
create index if not exists upload_log_user_time_idx on public.upload_log (user_id, created_at);
alter table public.upload_log enable row level security;   -- no policies: not readable via the API

create or replace function public.log_upload()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.bucket_id = 'images' then
    insert into public.upload_log (user_id) values (coalesce(auth.uid(), new.owner));
  end if;
  return new;
end $$;

drop trigger if exists on_image_upload on storage.objects;
create trigger on_image_upload after insert on storage.objects
  for each row execute function public.log_upload();

-- Uploads of a user in the last hour (used by the policies and the studio UI)
create or replace function public.uploads_last_hour(uid uuid)
returns integer language sql stable security definer set search_path = public as $$
  select count(*)::int from public.upload_log
  where user_id = uid and created_at > now() - interval '1 hour'
$$;

create or replace function public.my_upload_quota()
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'used', public.uploads_last_hour(auth.uid()),
    'limit', public.upload_limit_per_hour(),
    'resets_at', (select min(created_at) + interval '1 hour' from public.upload_log
                  where user_id = auth.uid() and created_at > now() - interval '1 hour'))
$$;
grant execute on function public.my_upload_quota() to authenticated;

-- 3. Storage: own folder only, max 10 per hour, max 10 MB, images only ----------
update storage.buckets
set file_size_limit = 10 * 1024 * 1024,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'images';

drop policy if exists "owners upload images" on storage.objects;
create policy "owners upload images" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'images'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.uploads_last_hour(auth.uid()) < public.upload_limit_per_hour()
  );

-- 4. Image rows & avatars may only point to the creator's own uploads -----------
--    (prevents foreign URLs that could break or hijack the public pages)
create or replace function public.is_own_upload(url text)
returns boolean language sql stable as $$
  select url ~ ('^https://[a-z0-9]+\.supabase\.co/storage/v1/object/public/images/' || auth.uid()::text || '/')
$$;

drop policy if exists "owners manage images" on public.images;
drop policy if exists "owners insert images" on public.images;
drop policy if exists "owners update images" on public.images;
drop policy if exists "owners delete images" on public.images;

create policy "owners insert images" on public.images
  for insert to authenticated
  with check (
    owner_id = auth.uid()
    and public.is_own_upload(url)
    and storage_path like auth.uid()::text || '/%'
    and exists (select 1 from public.entities e where e.id = entity_id and e.owner_id = auth.uid())
    and (select count(*) from public.images i
         where i.owner_id = auth.uid() and i.created_at > now() - interval '1 hour')
        < public.upload_limit_per_hour()
  );

create policy "owners update images" on public.images
  for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid() and public.is_own_upload(url));

create policy "owners delete images" on public.images
  for delete to authenticated
  using (owner_id = auth.uid());

drop policy if exists "owners manage entities" on public.entities;
create policy "owners manage entities" on public.entities
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid() and (avatar_url is null or public.is_own_upload(avatar_url)));

-- 5. At most 20 characters/brands per creator ------------------------------------
create or replace function public.check_entity_limit()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.entities where owner_id = new.owner_id) >= 20 then
    raise exception 'Maximal 20 Profile pro Creator.';
  end if;
  return new;
end $$;

drop trigger if exists entity_limit on public.entities;
create trigger entity_limit before insert on public.entities
  for each row execute function public.check_entity_limit();
