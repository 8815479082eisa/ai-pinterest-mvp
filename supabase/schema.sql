-- Muse – database schema. Run once in the Supabase SQL editor.

-- Characters & brands ------------------------------------------------------
create table if not exists public.entities (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid references auth.users (id) on delete cascade,
  slug        text not null unique check (slug ~ '^[a-z0-9-]{2,40}$'),
  name        text not null,
  kind        text not null default 'character' check (kind in ('character', 'brand')),
  tagline     text not null default '',
  bio         text not null default '',
  creator     text not null default '',        -- display name of the human creator
  avatar_url  text,
  followers   integer not null default 0,
  published   boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Images ------------------------------------------------------------------
create table if not exists public.images (
  id          uuid primary key default gen_random_uuid(),
  entity_id   uuid not null references public.entities (id) on delete cascade,
  owner_id    uuid references auth.users (id) on delete cascade,
  url         text not null,
  storage_path text,                            -- set for uploaded files
  width       integer not null,
  height      integer not null,
  alt         text not null default '',
  published   boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists images_entity_idx on public.images (entity_id, created_at);

-- Row Level Security: public sees only published, owners manage their own --
alter table public.entities enable row level security;
alter table public.images   enable row level security;

drop policy if exists "public reads published entities" on public.entities;
create policy "public reads published entities" on public.entities
  for select using (published or owner_id = auth.uid());

drop policy if exists "owners manage entities" on public.entities;
create policy "owners manage entities" on public.entities
  for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "public reads published images" on public.images;
create policy "public reads published images" on public.images
  for select using (
    owner_id = auth.uid()
    or (published and exists (
      select 1 from public.entities e where e.id = entity_id and e.published))
  );

drop policy if exists "owners manage images" on public.images;
create policy "owners manage images" on public.images
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid()
    and exists (select 1 from public.entities e where e.id = entity_id and e.owner_id = auth.uid()));

-- Storage bucket for uploads: public read, owners write into <user-id>/... --
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

drop policy if exists "owners upload images" on storage.objects;
create policy "owners upload images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "owners delete images" on storage.objects;
create policy "owners delete images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'images' and (storage.foldername(name))[1] = auth.uid()::text);

-- Demo content (the three original characters, no owner) -----------------
insert into public.entities (slug, name, kind, tagline, bio, creator, avatar_url, followers, published) values
  ('noa-vale', 'Noa Vale', 'character', 'Digitale Muse für Stoff & Bewegung',
   'Noa denkt in Falten, Licht und Seide. Eine KI-Muse, die Mode nicht trägt, sondern sie träumt — jede Serie beginnt mit einer einzigen Bewegung.',
   'Lena Arendt', '/images/noa-vale/avatar.jpg', 48210, true),
  ('monolith', 'MONOLITH', 'brand', 'KI-Designmarke für stille Objekte',
   'MONOLITH ist eine KI-Marke für Objekte, die es nicht gibt — noch nicht. Bögen, Platten, Kugeln. Architektur als Haltung, Licht als Material.',
   'Jonas Wieland', '/images/monolith/avatar.jpg', 21875, true),
  ('iris-null', 'Iris Null', 'character', 'Horizonte, die niemand fotografiert hat',
   'Iris ist eine KI-Fotografin ohne Kamera. Sie sammelt Horizonte aus Erinnerungen, die nie stattgefunden haben — Nebel, Wasser, ein einzelnes Licht.',
   'Mara Sadeghi', '/images/iris-null/avatar.jpg', 96402, true)
on conflict (slug) do nothing;

insert into public.images (entity_id, url, width, height, alt, published, created_at)
select e.id, '/images/' || e.slug || '/0' || n || '.jpg', 1200,
       (array[1680, 1200, 1500, 1920, 960, 1596])[n],
       e.name || ' – Bild ' || n, true, now() - (n || ' minutes')::interval
from public.entities e, generate_series(1, 6) n
where e.slug in ('noa-vale', 'monolith', 'iris-null')
  and not exists (select 1 from public.images i where i.entity_id = e.id);
