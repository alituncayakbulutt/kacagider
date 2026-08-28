-- KaçaGider Marketplace production backend
-- Bu migration Supabase SQL Editor'da 2026-08-25 tarihinde uygulanmıştır.

begin;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  city text,
  district text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
revoke all on table public.profiles from anon, authenticated;
grant select, update on table public.profiles to authenticated;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select to authenticated using (id = (select auth.uid()));

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('phone','tablet','computer','watch','console')),
  brand text not null,
  model text not null,
  storage text,
  color text,
  city text,
  district text,
  description text,
  seller_price numeric(12,2) check (seller_price is null or seller_price >= 0),
  market_value numeric(12,2) check (market_value is null or market_value >= 0),
  details jsonb not null default '[]'::jsonb,
  seller_name text,
  contact_phone text,
  status text not null default 'draft' check (status in ('draft','published','sold','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists listings_status_created_idx on public.listings(status, created_at desc);
create index if not exists listings_category_idx on public.listings(category);
create index if not exists listings_user_idx on public.listings(user_id);
create index if not exists listings_brand_model_idx on public.listings(brand, model);

alter table public.listings enable row level security;
revoke all on table public.listings from anon, authenticated;
grant select on table public.listings to anon, authenticated;
grant insert, update, delete on table public.listings to authenticated;

drop policy if exists "listings_public_read" on public.listings;
create policy "listings_public_read" on public.listings for select to anon, authenticated using (status = 'published' or user_id = (select auth.uid()));

drop policy if exists "listings_insert_own" on public.listings;
create policy "listings_insert_own" on public.listings for insert to authenticated with check (user_id = (select auth.uid()));

drop policy if exists "listings_update_own" on public.listings;
create policy "listings_update_own" on public.listings for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists "listings_delete_own" on public.listings;
create policy "listings_delete_own" on public.listings for delete to authenticated using (user_id = (select auth.uid()));

create table if not exists public.listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  object_path text not null unique,
  sort_order integer not null default 0 check (sort_order >= 0 and sort_order <= 4),
  alt_text text,
  created_at timestamptz not null default now(),
  unique(listing_id, sort_order)
);

create index if not exists listing_photos_listing_idx on public.listing_photos(listing_id);
create index if not exists listing_photos_user_idx on public.listing_photos(user_id);

alter table public.listing_photos enable row level security;
revoke all on table public.listing_photos from anon, authenticated;
grant select on table public.listing_photos to anon, authenticated;
grant insert, update, delete on table public.listing_photos to authenticated;

drop policy if exists "listing_photos_public_read" on public.listing_photos;
create policy "listing_photos_public_read" on public.listing_photos for select to anon, authenticated using (
  exists (select 1 from public.listings l where l.id = listing_photos.listing_id and (l.status = 'published' or l.user_id = (select auth.uid())))
);

drop policy if exists "listing_photos_insert_own" on public.listing_photos;
create policy "listing_photos_insert_own" on public.listing_photos for insert to authenticated with check (
  user_id = (select auth.uid()) and exists (select 1 from public.listings l where l.id = listing_photos.listing_id and l.user_id = (select auth.uid()))
);

drop policy if exists "listing_photos_update_own" on public.listing_photos;
create policy "listing_photos_update_own" on public.listing_photos for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists "listing_photos_delete_own" on public.listing_photos;
create policy "listing_photos_delete_own" on public.listing_photos for delete to authenticated using (user_id = (select auth.uid()));

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();

drop trigger if exists listings_set_updated_at on public.listings;
create trigger listings_set_updated_at before update on public.listings for each row execute procedure public.set_updated_at();

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('listing-images','listing-images',true,6291456,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "listing_images_public_read" on storage.objects;
create policy "listing_images_public_read" on storage.objects for select to public using (bucket_id = 'listing-images');

drop policy if exists "listing_images_insert_own" on storage.objects;
create policy "listing_images_insert_own" on storage.objects for insert to authenticated with check (
  bucket_id='listing-images' and (storage.foldername(name))[1]=(select auth.uid()::text) and lower(storage.extension(name)) in ('jpg','jpeg','png','webp')
);

drop policy if exists "listing_images_update_own" on storage.objects;
create policy "listing_images_update_own" on storage.objects for update to authenticated using (bucket_id='listing-images' and owner_id=(select auth.uid()::text)) with check (bucket_id='listing-images' and owner_id=(select auth.uid()::text));

drop policy if exists "listing_images_delete_own" on storage.objects;
create policy "listing_images_delete_own" on storage.objects for delete to authenticated using (bucket_id='listing-images' and owner_id=(select auth.uid()::text));

commit;
