-- KaçaGider Telefoncuya Sat — teklif güven entegrasyonu

-- Aktif telefoncuları güven profiline senkronla.
insert into public.trust_profiles(user_id, account_type, display_name, dealer_verified, updated_at)
select dp.user_id, 'dealer', dp.store_name, (dp.active and dp.verified_at is not null), now()
from public.dealer_profiles dp
on conflict (user_id) do update set
  account_type='dealer',
  display_name=coalesce(excluded.display_name, public.trust_profiles.display_name),
  dealer_verified=excluded.dealer_verified,
  updated_at=now();

create or replace function public.sync_dealer_trust_profile()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin
  insert into public.trust_profiles(user_id,account_type,display_name,dealer_verified,updated_at)
  values(new.user_id,'dealer',new.store_name,(new.active and new.verified_at is not null),now())
  on conflict(user_id) do update set
    account_type='dealer',
    display_name=coalesce(excluded.display_name,public.trust_profiles.display_name),
    dealer_verified=excluded.dealer_verified,
    updated_at=now();
  return new;
end;
$$;

drop trigger if exists dealer_profile_trust_sync on public.dealer_profiles;
create trigger dealer_profile_trust_sync
after insert or update of store_name,active,verified_at on public.dealer_profiles
for each row execute function public.sync_dealer_trust_profile();

-- Teklif kartından güven bilgisini güvenli biçimde getirir.
create or replace function public.get_dealer_offer_trust(p_offer_id uuid)
returns table(
  offer_id uuid,
  dealer_user_id uuid,
  dealer_store_name text,
  trust_score integer,
  trust_label text,
  dealer_verified boolean,
  email_verified boolean,
  phone_verified boolean,
  identity_verified boolean,
  completed_transaction_count integer,
  positive_signal_count integer,
  negative_signal_count integer,
  account_age_days integer
)
language plpgsql
stable
security definer
set search_path=public,auth
as $$
declare
  v_uid uuid:=auth.uid();
  v_request_id uuid;
  v_owner uuid;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select o.request_id into v_request_id from public.dealer_offers o where o.id=p_offer_id;
  if v_request_id is null then raise exception 'OFFER_NOT_FOUND'; end if;
  select r.user_id into v_owner from public.dealer_sell_requests r where r.id=v_request_id;
  if v_owner<>v_uid and not public.is_admin() then raise exception 'FORBIDDEN'; end if;

  return query
  select o.id,
         o.dealer_id,
         dp.store_name,
         tp.trust_score,
         tp.trust_label,
         tp.dealer_verified,
         tp.email_verified,
         tp.phone_verified,
         tp.identity_verified,
         tp.completed_transaction_count,
         tp.positive_signal_count,
         tp.negative_signal_count,
         tp.account_age_days
  from public.dealer_offers o
  join public.dealer_profiles dp on dp.user_id=o.dealer_id
  left join lateral public.get_public_trust_profile(o.dealer_id) tp on true
  where o.id=p_offer_id;
end;
$$;

revoke all on function public.get_dealer_offer_trust(uuid) from public;
grant execute on function public.get_dealer_offer_trust(uuid) to authenticated;

-- Mevcut teklif liste RPC'sine güven alanlarını ekle.
create or replace function public.seller_list_request_offers(p_request_id uuid)
returns table(
  offer_id uuid,
  dealer_user_id uuid,
  dealer_store_name text,
  dealer_city text,
  dealer_district text,
  amount numeric,
  note text,
  offer_status text,
  valid_until timestamptz,
  created_at timestamptz,
  is_expired boolean,
  trust_score integer,
  trust_label text,
  dealer_verified boolean,
  completed_transaction_count integer
)
language plpgsql
security definer
set search_path=public,auth
as $$
declare
  v_uid uuid:=auth.uid();
  v_owner uuid;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select r.user_id into v_owner from public.dealer_sell_requests r where r.id=p_request_id;
  if v_owner is null then raise exception 'REQUEST_NOT_FOUND'; end if;
  if v_owner<>v_uid and not public.is_admin() then raise exception 'FORBIDDEN'; end if;

  return query
  select o.id,
         o.dealer_id,
         dp.store_name,
         dp.city,
         dp.district,
         o.amount,
         o.note,
         case when o.status='active' and o.valid_until<=now() then 'expired' else o.status end,
         o.valid_until,
         o.created_at,
         (o.status='active' and o.valid_until<=now()),
         tp.trust_score,
         tp.trust_label,
         tp.dealer_verified,
         tp.completed_transaction_count
  from public.dealer_offers o
  join public.dealer_profiles dp on dp.user_id=o.dealer_id and dp.active=true
  left join lateral public.get_public_trust_profile(o.dealer_id) tp on true
  where o.request_id=p_request_id and o.status<>'withdrawn'
  order by
    case when o.status='accepted' then 0 when o.status='active' and o.valid_until>now() then 1 else 2 end,
    o.amount desc,
    o.created_at asc;
end;
$$;

grant execute on function public.seller_list_request_offers(uuid) to authenticated;