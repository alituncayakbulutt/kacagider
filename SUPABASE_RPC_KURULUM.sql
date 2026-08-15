-- KaçaGider SEO sayfaları için yalnızca güvenli fiyat özetini döndüren RPC.
-- price_estimates tablosunu doğrudan herkese açmaz.

create or replace function public.get_public_price_estimate(
  p_category text,
  p_brand text,
  p_model text,
  p_storage_gb integer
)
returns table (
  estimated_price numeric,
  quick_sale_price numeric,
  listing_price numeric,
  confidence_score numeric,
  observation_count integer,
  calculated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    pe.estimated_price,
    pe.quick_sale_price,
    pe.listing_price,
    pe.confidence_score,
    pe.observation_count,
    pe.calculated_at
  from public.price_estimates pe
  where lower(pe.category) = lower(p_category)
    and lower(pe.brand) = lower(p_brand)
    and lower(pe.model) = lower(p_model)
    and pe.storage_gb = p_storage_gb
  order by pe.calculated_at desc nulls last
  limit 1;
$$;

revoke all on function public.get_public_price_estimate(text,text,text,integer) from public;
grant execute on function public.get_public_price_estimate(text,text,text,integer) to anon, authenticated;
