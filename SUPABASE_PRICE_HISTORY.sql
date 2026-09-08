-- KaçaGider FAZ 6 — Fiyat Geçmişi / Değer Kaybı veri katmanı
-- Kişisel veri döndürmez. Yalnızca model + hafıza bazında günlük toplulaştırılmış fiyat sinyalleri verir.
-- Tarih üretmez ve eksik dönemleri yapay veri ile doldurmaz.

create or replace function public.get_price_history_signal(
  p_category text,
  p_brand text,
  p_model text,
  p_storage_label text default '',
  p_days integer default 180
)
returns table(
  price_date date,
  valuation_median numeric,
  valuation_count integer,
  sale_median numeric,
  sale_count integer,
  market_median numeric,
  market_count integer
)
language sql
stable
security definer
set search_path=public
as $$
with params as (
  select
    lower(trim(coalesce(p_category,''))) as category_key,
    lower(trim(coalesce(p_brand,''))) as brand_key,
    lower(trim(coalesce(p_model,''))) as model_key,
    lower(trim(coalesce(p_storage_label,''))) as storage_key,
    greatest(7,least(coalesce(p_days,180),365)) as day_limit
), dates as (
  select day::date as price_date
  from generate_series(
    current_date - ((select day_limit from params)-1),
    current_date,
    interval '1 day'
  ) day
), valuation_daily as (
  select
    uv.created_at::date as price_date,
    percentile_cont(0.5) within group(order by uv.estimated_price)::numeric as valuation_median,
    count(*)::int as valuation_count
  from public.user_valuations uv, params p
  where uv.estimated_price is not null and uv.estimated_price>0
    and uv.created_at >= current_date - (p.day_limit-1)
    and lower(trim(coalesce(uv.category,'')))=p.category_key
    and lower(trim(coalesce(uv.brand,'')))=p.brand_key
    and lower(trim(coalesce(uv.model,'')))=p.model_key
    and (p.storage_key='' or lower(trim(coalesce(uv.storage,'')))=p.storage_key)
  group by uv.created_at::date
), sale_daily as (
  select
    us.sold_at::date as price_date,
    percentile_cont(0.5) within group(order by us.sale_price)::numeric as sale_median,
    count(*)::int as sale_count
  from public.user_sales us, params p
  where us.sale_price is not null and us.sale_price>0
    and us.sold_at >= current_date - (p.day_limit-1)
    and lower(trim(coalesce(us.category,'')))=p.category_key
    and lower(trim(coalesce(us.brand,'')))=p.brand_key
    and lower(trim(coalesce(us.model,'')))=p.model_key
    and (p.storage_key='' or lower(trim(coalesce(us.storage,'')))=p.storage_key)
  group by us.sold_at::date
), market_daily as (
  select
    mpo.observed_at::date as price_date,
    percentile_cont(0.5) within group(order by mpo.price)::numeric as market_median,
    count(*)::int as market_count
  from public.market_price_observations mpo, params p
  where mpo.price is not null and mpo.price>0
    and mpo.observed_at >= current_date - (p.day_limit-1)
    and lower(trim(coalesce(mpo.category,'')))=p.category_key
    and lower(trim(coalesce(mpo.brand,'')))=p.brand_key
    and lower(trim(coalesce(mpo.model,'')))=p.model_key
    and (p.storage_key='' or lower(trim(coalesce(mpo.storage,'')))=p.storage_key)
  group by mpo.observed_at::date
)
select
  d.price_date,
  v.valuation_median,
  coalesce(v.valuation_count,0),
  s.sale_median,
  coalesce(s.sale_count,0),
  m.market_median,
  coalesce(m.market_count,0)
from dates d
left join valuation_daily v using(price_date)
left join sale_daily s using(price_date)
left join market_daily m using(price_date)
where v.price_date is not null or s.price_date is not null or m.price_date is not null
order by d.price_date;
$$;

revoke all on function public.get_price_history_signal(text,text,text,text,integer) from public;
grant execute on function public.get_price_history_signal(text,text,text,text,integer) to anon,authenticated;
