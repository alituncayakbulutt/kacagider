create or replace function public.dealer_list_available_requests_v2()
returns table(
  id uuid,
  request_code text,
  brand text,
  model text,
  storage text,
  market_value numeric,
  city text,
  district text,
  battery smallint,
  warranty text,
  box_invoice text,
  notes text,
  has_damage boolean,
  valuation_snapshot jsonb,
  status text,
  created_at timestamptz,
  my_offer_amount numeric,
  my_offer_status text,
  my_offer_valid_until timestamptz,
  match_scope text,
  active_offer_count bigint,
  offer_limit integer
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_uid uuid := auth.uid();
  v_city text;
  v_district text;
  v_admin boolean := public.is_admin();
  v_limit integer := 8;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select dp.city, dp.district
    into v_city, v_district
  from public.dealer_profiles dp
  where dp.user_id = v_uid
    and dp.active = true;

  if v_city is null and not v_admin then
    raise exception 'DEALER_NOT_APPROVED';
  end if;

  return query
  select
    r.id,
    r.request_code,
    r.brand,
    r.model,
    r.storage,
    r.market_value,
    r.city,
    r.district,
    r.battery,
    r.warranty,
    r.box_invoice,
    r.notes,
    r.has_damage,
    r.valuation_snapshot,
    r.status,
    r.created_at,
    o.amount,
    o.status,
    o.valid_until,
    case
      when v_admin then 'admin'
      when lower(trim(coalesce(r.district, ''))) = lower(trim(coalesce(v_district, ''))) then 'district'
      else 'city'
    end as match_scope,
    coalesce(oc.active_offer_count, 0)::bigint,
    v_limit
  from public.dealer_sell_requests r
  left join public.dealer_offers o
    on o.request_id = r.id
   and o.dealer_id = v_uid
  left join lateral (
    select count(*)::bigint as active_offer_count
    from public.dealer_offers oo
    where oo.request_id = r.id
      and oo.status = 'active'
      and oo.valid_until > now()
  ) oc on true
  where r.status in ('open', 'offer_received')
    and r.user_id <> v_uid
    and (v_admin or lower(trim(r.city)) = lower(trim(v_city)));
end;
$$;

revoke all on function public.dealer_list_available_requests_v2() from public;
revoke all on function public.dealer_list_available_requests_v2() from anon;
grant execute on function public.dealer_list_available_requests_v2() to authenticated;
