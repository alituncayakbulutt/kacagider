-- KaçaGider Marketplace
-- E-posta doğrulanmadan ilan/fotoğraf yazılmasını veritabanı seviyesinde engeller.

begin;

create or replace function public.is_current_user_email_verified()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from auth.users u
    where u.id = auth.uid()
      and u.email_confirmed_at is not null
  );
$$;

revoke all on function public.is_current_user_email_verified() from public;
grant execute on function public.is_current_user_email_verified() to authenticated;

-- İlan oluşturma: yalnızca kendi hesabı + doğrulanmış e-posta.
drop policy if exists "listings_insert_own" on public.listings;
create policy "listings_insert_own"
on public.listings
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and public.is_current_user_email_verified()
);

-- İlan güncelleme: yalnızca sahibi + doğrulanmış e-posta.
drop policy if exists "listings_update_own" on public.listings;
create policy "listings_update_own"
on public.listings
for update
to authenticated
using (
  user_id = (select auth.uid())
  and public.is_current_user_email_verified()
)
with check (
  user_id = (select auth.uid())
  and public.is_current_user_email_verified()
);

-- Fotoğraf kayıtları.
drop policy if exists "listing_photos_insert_own" on public.listing_photos;
create policy "listing_photos_insert_own"
on public.listing_photos
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and public.is_current_user_email_verified()
  and exists (
    select 1
    from public.listings l
    where l.id = listing_photos.listing_id
      and l.user_id = (select auth.uid())
  )
);

drop policy if exists "listing_photos_update_own" on public.listing_photos;
create policy "listing_photos_update_own"
on public.listing_photos
for update
to authenticated
using (
  user_id = (select auth.uid())
  and public.is_current_user_email_verified()
)
with check (
  user_id = (select auth.uid())
  and public.is_current_user_email_verified()
);

-- Storage yükleme/güncelleme de doğrulanmış hesap gerektirir.
drop policy if exists "listing_images_insert_own" on storage.objects;
create policy "listing_images_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'listing-images'
  and public.is_current_user_email_verified()
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and lower(storage.extension(name)) in ('jpg','jpeg','png','webp')
);

drop policy if exists "listing_images_update_own" on storage.objects;
create policy "listing_images_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'listing-images'
  and owner_id = (select auth.uid()::text)
  and public.is_current_user_email_verified()
)
with check (
  bucket_id = 'listing-images'
  and owner_id = (select auth.uid()::text)
  and public.is_current_user_email_verified()
);

commit;
