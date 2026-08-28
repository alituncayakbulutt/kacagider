-- KaçaGider Marketplace: uygulanmadan önce Supabase SQL Editor'de gözden geçirin.
-- Bu migration fiyatlandırma tablolarına dokunmaz.

create extension if not exists pgcrypto;

create table if not exists public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('draft', 'pending', 'published', 'paused', 'sold', 'rejected')),
  category text not null,
  brand text not null,
  model text not null,
  storage_value text,
  color text,
  city text,
  district text,
  listing_price numeric(12,2) not null check (listing_price > 0),
  market_value numeric(12,2),
  description text not null default '',
  device_details jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketplace_listings_public_index
  on public.marketplace_listings (status, created_at desc);
create index if not exists marketplace_listings_filter_index
  on public.marketplace_listings (category, brand, model, city);

create table if not exists public.marketplace_listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.marketplace_listings(id) on delete cascade,
  storage_path text not null unique,
  position smallint not null default 0 check (position between 0 and 4),
  created_at timestamptz not null default now(),
  unique (listing_id, position)
);

create index if not exists marketplace_listing_photos_listing_index
  on public.marketplace_listing_photos (listing_id, position);

create table if not exists public.marketplace_favorites (
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  listing_id uuid not null references public.marketplace_listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (owner_id, listing_id)
);

create table if not exists public.marketplace_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  listing_id uuid not null references public.marketplace_listings(id) on delete cascade,
  reason text not null check (char_length(reason) between 3 and 120),
  note text not null default '' check (char_length(note) <= 1000),
  created_at timestamptz not null default now(),
  unique (reporter_id, listing_id)
);

alter table public.marketplace_listings enable row level security;
alter table public.marketplace_listing_photos enable row level security;
alter table public.marketplace_favorites enable row level security;
alter table public.marketplace_reports enable row level security;

drop policy if exists "Published listings are public" on public.marketplace_listings;
create policy "Published listings are public" on public.marketplace_listings
  for select using (status = 'published' or owner_id = auth.uid());
drop policy if exists "Owners create listings" on public.marketplace_listings;
create policy "Owners create listings" on public.marketplace_listings
  for insert to authenticated with check (owner_id = auth.uid());
drop policy if exists "Owners update listings" on public.marketplace_listings;
create policy "Owners update listings" on public.marketplace_listings
  for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists "Owners delete listings" on public.marketplace_listings;
create policy "Owners delete listings" on public.marketplace_listings
  for delete to authenticated using (owner_id = auth.uid());

drop policy if exists "Published listing photos are public" on public.marketplace_listing_photos;
create policy "Published listing photos are public" on public.marketplace_listing_photos
  for select using (exists (
    select 1 from public.marketplace_listings l
    where l.id = listing_id and (l.status = 'published' or l.owner_id = auth.uid())
  ));
drop policy if exists "Owners manage listing photos" on public.marketplace_listing_photos;
create policy "Owners manage listing photos" on public.marketplace_listing_photos
  for all to authenticated using (exists (
    select 1 from public.marketplace_listings l where l.id = listing_id and l.owner_id = auth.uid()
  )) with check (exists (
    select 1 from public.marketplace_listings l where l.id = listing_id and l.owner_id = auth.uid()
  ));

drop policy if exists "Users manage own favorites" on public.marketplace_favorites;
create policy "Users manage own favorites" on public.marketplace_favorites
  for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "Users create own reports" on public.marketplace_reports;
create policy "Users create own reports" on public.marketplace_reports
  for insert to authenticated with check (reporter_id = auth.uid());
drop policy if exists "Users see own reports" on public.marketplace_reports;
create policy "Users see own reports" on public.marketplace_reports
  for select to authenticated using (reporter_id = auth.uid());

-- Storage bucket: private write path, public read only through an explicit URL policy.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('marketplace-listing-photos', 'marketplace-listing-photos', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Listing photo uploads are owner scoped" on storage.objects;
create policy "Listing photo uploads are owner scoped" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'marketplace-listing-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );
drop policy if exists "Listing photo owners can update" on storage.objects;
create policy "Listing photo owners can update" on storage.objects
  for update to authenticated using (
    bucket_id = 'marketplace-listing-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );
drop policy if exists "Listing photo owners can delete" on storage.objects;
create policy "Listing photo owners can delete" on storage.objects
  for delete to authenticated using (
    bucket_id = 'marketplace-listing-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Modération: ilanın yayınlanması varsayılan olarak pending kalır.
-- Yayın yetkisi bir yönetici işlemiyle status='published' olarak verilmelidir.
