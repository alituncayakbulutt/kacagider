-- KaçaGider Model Talebi / Alıcı İlgisi
-- Bu migration canlı veritabanına otomatik uygulanmaz.
-- Supabase SQL Editor üzerinden kontrollü olarak çalıştırılmalıdır.

create extension if not exists pgcrypto;

create table if not exists public.model_demand_signals (
  id uuid primary key default gen_random_uuid(),
  category_key text not null,
  brand_key text not null,
  model_key text not null,
  storage_key text not null default '',
  client_key text not null,
  budget_min integer,
  budget_max integer,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint model_demand_budget_min_positive check (budget_min is null or budget_min > 0),
  constraint model_demand_budget_max_positive check (budget_max is null or budget_max > 0),
  constraint model_demand_budget_order check (budget_min is null or budget_max is null or budget_max >= budget_min),
  constraint model_demand_client_key_length check (char_length(client_key) between 8 and 128),
  constraint model_demand_unique_client_model unique (category_key, brand_key, model_key, storage_key, client_key)
);

create index if not exists idx_model_demand_lookup
  on public.model_demand_signals (category_key, brand_key, model_key, storage_key)
  where active = true;

alter table public.model_demand_signals enable row level security;
revoke all on table public.model_demand_signals from anon, authenticated;

create or replace function public.get_model_demand_signal(
  p_category text,
  p_brand text,
  p_model text,
  p_storage_label text default ''
)
returns table (
  buyer_count bigint,
  budget_count bigint,
  avg_budget_min integer,
  avg_budget_max integer,
  active_listing_count bigint,
  demand_level text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_category text := lower(trim(coalesce(p_category, '')));
  v_brand text := lower(trim(coalesce(p_brand, '')));
  v_model text := lower(trim(coalesce(p_model, '')));
  v_storage text := lower(trim(coalesce(p_storage_label, '')));
  v_buyers bigint := 0;
  v_budget_count bigint := 0;
  v_budget_min numeric := null;
  v_budget_max numeric := null;
  v_listings bigint := 0;
  v_ratio numeric := 0;
begin
  if v_category = '' or v_brand = '' or v_model = '' then
    raise exception 'category, brand and model are required';
  end if;

  select
    count(*),
    count(*) filter (where budget_min is not null or budget_max is not null),
    avg(budget_min) filter (where budget_min is not null),
    avg(budget_max) filter (where budget_max is not null)
  into v_buyers, v_budget_count, v_budget_min, v_budget_max
  from public.model_demand_signals
  where active = true
    and category_key = v_category
    and brand_key = v_brand
    and model_key = v_model
    and (v_storage = '' or storage_key = v_storage);

  select count(*)
  into v_listings
  from public.listings
  where status = 'published'
    and lower(trim(coalesce(category, ''))) = v_category
    and lower(trim(coalesce(brand, ''))) = v_brand
    and lower(trim(coalesce(model, ''))) = v_model
    and (v_storage = '' or lower(trim(coalesce(storage, ''))) = v_storage);

  v_ratio := case when v_listings > 0 then v_buyers::numeric / v_listings::numeric else v_buyers::numeric end;

  return query select
    v_buyers,
    v_budget_count,
    case when v_budget_min is null then null else round(v_budget_min)::integer end,
    case when v_budget_max is null then null else round(v_budget_max)::integer end,
    v_listings,
    case
      when v_buyers = 0 then 'collecting'
      when v_buyers >= 8 and v_ratio >= 2 then 'high'
      when v_buyers >= 3 and v_ratio >= 1 then 'medium'
      else 'low'
    end;
end;
$$;

create or replace function public.register_model_demand(
  p_category text,
  p_brand text,
  p_model text,
  p_storage_label text,
  p_client_key text,
  p_budget_min integer default null,
  p_budget_max integer default null
)
returns table (
  buyer_count bigint,
  budget_count bigint,
  avg_budget_min integer,
  avg_budget_max integer,
  active_listing_count bigint,
  demand_level text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_category text := lower(trim(coalesce(p_category, '')));
  v_brand text := lower(trim(coalesce(p_brand, '')));
  v_model text := lower(trim(coalesce(p_model, '')));
  v_storage text := lower(trim(coalesce(p_storage_label, '')));
  v_client text := trim(coalesce(p_client_key, ''));
begin
  if v_category = '' or v_brand = '' or v_model = '' then
    raise exception 'category, brand and model are required';
  end if;
  if char_length(v_client) < 8 or char_length(v_client) > 128 then
    raise exception 'invalid client key';
  end if;
  if p_budget_min is not null and p_budget_min <= 0 then
    raise exception 'budget_min must be positive';
  end if;
  if p_budget_max is not null and p_budget_max <= 0 then
    raise exception 'budget_max must be positive';
  end if;
  if p_budget_min is not null and p_budget_max is not null and p_budget_max < p_budget_min then
    raise exception 'budget_max must be greater than or equal to budget_min';
  end if;

  insert into public.model_demand_signals (
    category_key, brand_key, model_key, storage_key, client_key,
    budget_min, budget_max, active, updated_at
  ) values (
    v_category, v_brand, v_model, v_storage, v_client,
    p_budget_min, p_budget_max, true, now()
  )
  on conflict (category_key, brand_key, model_key, storage_key, client_key)
  do update set
    budget_min = excluded.budget_min,
    budget_max = excluded.budget_max,
    active = true,
    updated_at = now();

  return query
  select * from public.get_model_demand_signal(v_category, v_brand, v_model, v_storage);
end;
$$;

revoke all on function public.get_model_demand_signal(text,text,text,text) from public;
revoke all on function public.register_model_demand(text,text,text,text,text,integer,integer) from public;
grant execute on function public.get_model_demand_signal(text,text,text,text) to anon, authenticated;
grant execute on function public.register_model_demand(text,text,text,text,text,integer,integer) to anon, authenticated;
