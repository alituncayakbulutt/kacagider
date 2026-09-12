-- KaçaGider Supabase security hardening
-- Applied to production on 2026-09-09.
-- This file documents the production changes so the repository remains reproducible.

-- 1) RPC-only tables: keep RLS explicit and deny direct client access.
alter table if exists public.ai_photo_usage enable row level security;
drop policy if exists rpc_only_deny_direct_access on public.ai_photo_usage;
create policy rpc_only_deny_direct_access on public.ai_photo_usage
for all to anon, authenticated using (false) with check (false);

alter table if exists public.model_demand_signals enable row level security;
drop policy if exists rpc_only_deny_direct_access on public.model_demand_signals;
create policy rpc_only_deny_direct_access on public.model_demand_signals
for all to anon, authenticated using (false) with check (false);

alter table if exists public.trust_events enable row level security;
drop policy if exists rpc_only_deny_direct_access on public.trust_events;
create policy rpc_only_deny_direct_access on public.trust_events
for all to anon, authenticated using (false) with check (false);

-- 2) Optimize auth.uid() RLS checks so they are evaluated once per statement.
drop policy if exists dealer_preferences_select_own on public.dealer_device_preferences;
create policy dealer_preferences_select_own on public.dealer_device_preferences
for select to authenticated using (dealer_id = (select auth.uid()));

drop policy if exists dealer_preferences_insert_own on public.dealer_device_preferences;
create policy dealer_preferences_insert_own on public.dealer_device_preferences
for insert to authenticated with check (dealer_id = (select auth.uid()));

drop policy if exists dealer_preferences_delete_own on public.dealer_device_preferences;
create policy dealer_preferences_delete_own on public.dealer_device_preferences
for delete to authenticated using (dealer_id = (select auth.uid()));

drop policy if exists dealer_notifications_select_own on public.dealer_notifications;
create policy dealer_notifications_select_own on public.dealer_notifications
for select to authenticated using (dealer_id = (select auth.uid()));

drop policy if exists dealer_notifications_update_own on public.dealer_notifications;
create policy dealer_notifications_update_own on public.dealer_notifications
for update to authenticated
using (dealer_id = (select auth.uid()))
with check (dealer_id = (select auth.uid()));

drop policy if exists dealer_notification_settings_select_own on public.dealer_notification_settings;
create policy dealer_notification_settings_select_own on public.dealer_notification_settings
for select to authenticated using (dealer_id = (select auth.uid()));

drop policy if exists dealer_notification_settings_insert_own on public.dealer_notification_settings;
create policy dealer_notification_settings_insert_own on public.dealer_notification_settings
for insert to authenticated with check (
  dealer_id = (select auth.uid())
  and exists (
    select 1 from public.dealer_profiles dp
    where dp.user_id = (select auth.uid()) and dp.active = true
  )
);

drop policy if exists dealer_notification_settings_update_own on public.dealer_notification_settings;
create policy dealer_notification_settings_update_own on public.dealer_notification_settings
for update to authenticated
using (dealer_id = (select auth.uid()))
with check (dealer_id = (select auth.uid()));

drop policy if exists trust_profiles_select_own on public.trust_profiles;
create policy trust_profiles_select_own on public.trust_profiles
for select to authenticated using ((select auth.uid()) = user_id);

-- 3) Add covering indexes for foreign keys used by current marketplace/admin flows.
create index if not exists admin_audit_log_admin_user_id_idx on public.admin_audit_log(admin_user_id);
create index if not exists admin_users_created_by_idx on public.admin_users(created_by);
create index if not exists dealer_applications_reviewed_by_idx on public.dealer_applications(reviewed_by);
create index if not exists dealer_email_notifications_request_id_idx on public.dealer_email_notifications(request_id);
create index if not exists dealer_notifications_request_id_idx on public.dealer_notifications(request_id);
create index if not exists dealer_sale_outcomes_dealer_id_idx on public.dealer_sale_outcomes(dealer_id);
create index if not exists dealer_sale_outcomes_seller_id_idx on public.dealer_sale_outcomes(seller_id);
create index if not exists dealer_sell_requests_accepted_offer_id_idx on public.dealer_sell_requests(accepted_offer_id);
create index if not exists price_alert_notifications_alert_id_idx on public.price_alert_notifications(alert_id);

-- 4) Consolidate duplicate deny policies on the dealer email queue.
drop policy if exists dealer_email_notifications_deny_authenticated_select on public.dealer_email_notifications;
drop policy if exists dealer_email_notifications_deny_authenticated_write on public.dealer_email_notifications;
drop policy if exists dealer_email_notifications_no_client_access on public.dealer_email_notifications;
create policy dealer_email_notifications_no_client_access on public.dealer_email_notifications
for all to authenticated using (false) with check (false);

-- 5) Add authenticated AI cost-abuse protection.
create table if not exists public.kg_ai_user_daily_usage (
  user_id uuid not null,
  feature text not null,
  usage_day date not null,
  used integer not null default 0 check (used >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, feature, usage_day)
);
alter table public.kg_ai_user_daily_usage enable row level security;
drop policy if exists kg_ai_user_daily_usage_no_client_access on public.kg_ai_user_daily_usage;
create policy kg_ai_user_daily_usage_no_client_access on public.kg_ai_user_daily_usage
for all to anon, authenticated using (false) with check (false);

create or replace function public.kg_consume_ai_user_quota(
  p_user_id uuid,
  p_feature text,
  p_usage_day date,
  p_limit integer
) returns table(allowed boolean, used integer, remaining integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_feature text := left(trim(coalesce(p_feature,'')), 64);
  v_limit integer := greatest(1, least(coalesce(p_limit,1), 1000));
  v_used integer;
begin
  if p_user_id is null or v_feature = '' or p_usage_day is null then
    raise exception 'invalid_quota_input';
  end if;
  insert into public.kg_ai_user_daily_usage(user_id, feature, usage_day, used, updated_at)
  values (p_user_id, v_feature, p_usage_day, 0, now())
  on conflict (user_id, feature, usage_day) do nothing;
  update public.kg_ai_user_daily_usage
     set used = used + 1, updated_at = now()
   where user_id = p_user_id and feature = v_feature and usage_day = p_usage_day and used < v_limit
  returning kg_ai_user_daily_usage.used into v_used;
  if v_used is null then
    select u.used into v_used from public.kg_ai_user_daily_usage u
    where u.user_id=p_user_id and u.feature=v_feature and u.usage_day=p_usage_day;
    return query select false, coalesce(v_used,0), 0;
  end if;
  return query select true, v_used, greatest(0, v_limit-v_used);
end;
$$;
revoke all on function public.kg_consume_ai_user_quota(uuid,text,date,integer) from public, anon, authenticated;
grant execute on function public.kg_consume_ai_user_quota(uuid,text,date,integer) to service_role;

-- 6) Do not allow a normal account to self-label as a dealer.
create or replace function public.upsert_my_trust_profile(p_display_name text default null::text, p_account_type text default 'seller'::text)
returns void
language plpgsql
security definer
set search_path to 'public','auth'
as $$
declare
  v_uid uuid := auth.uid();
  v_type text := lower(trim(coalesce(p_account_type,'seller')));
begin
  if v_uid is null then raise exception 'authentication_required'; end if;
  if v_type not in ('seller','dealer') then raise exception 'invalid_account_type'; end if;
  if v_type='dealer' and not (
    exists(select 1 from public.dealer_profiles dp where dp.user_id=v_uid and dp.active=true)
    or public.is_admin()
  ) then raise exception 'dealer_not_verified'; end if;
  insert into public.trust_profiles(user_id,account_type,display_name,updated_at)
  values (v_uid,v_type,nullif(left(trim(coalesce(p_display_name,'')),120),''),now())
  on conflict (user_id) do update set
    account_type=excluded.account_type,
    display_name=coalesce(excluded.display_name,public.trust_profiles.display_name),
    updated_at=now();
end;
$$;
revoke all on function public.upsert_my_trust_profile(text,text) from public, anon;
grant execute on function public.upsert_my_trust_profile(text,text) to authenticated;

-- 7) Bound anonymous model-demand inputs to reduce data poisoning / storage abuse.
create or replace function public.register_model_demand(
  p_category text,
  p_brand text,
  p_model text,
  p_storage_label text,
  p_client_key text,
  p_budget_min integer default null,
  p_budget_max integer default null
) returns table(buyer_count bigint,budget_count bigint,avg_budget_min integer,avg_budget_max integer,active_listing_count bigint,demand_level text)
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_category text := lower(trim(coalesce(p_category,'')));
  v_brand text := lower(trim(coalesce(p_brand,'')));
  v_model text := lower(trim(coalesce(p_model,'')));
  v_storage text := lower(trim(coalesce(p_storage_label,'')));
  v_client text := trim(coalesce(p_client_key,''));
begin
  if v_category not in ('phone','tablet','computer','watch','console') then raise exception 'invalid category'; end if;
  if v_brand='' or v_model='' then raise exception 'brand and model are required'; end if;
  if char_length(v_brand)>80 or char_length(v_model)>120 or char_length(v_storage)>40 then raise exception 'device field too long'; end if;
  if char_length(v_client)<8 or char_length(v_client)>128 then raise exception 'invalid client key'; end if;
  if p_budget_min is not null and (p_budget_min<=0 or p_budget_min>5000000) then raise exception 'invalid budget_min'; end if;
  if p_budget_max is not null and (p_budget_max<=0 or p_budget_max>5000000) then raise exception 'invalid budget_max'; end if;
  if p_budget_min is not null and p_budget_max is not null and p_budget_max<p_budget_min then raise exception 'budget_max must be greater than or equal to budget_min'; end if;
  insert into public.model_demand_signals(category_key,brand_key,model_key,storage_key,client_key,budget_min,budget_max,active,updated_at)
  values(v_category,v_brand,v_model,v_storage,v_client,p_budget_min,p_budget_max,true,now())
  on conflict(category_key,brand_key,model_key,storage_key,client_key) do update set
    budget_min=excluded.budget_min,
    budget_max=excluded.budget_max,
    active=true,
    updated_at=now();
  return query select * from public.get_model_demand_signal(v_category,v_brand,v_model,v_storage);
end;
$$;
revoke all on function public.register_model_demand(text,text,text,text,text,integer,integer) from public;
grant execute on function public.register_model_demand(text,text,text,text,text,integer,integer) to anon, authenticated;

-- Note: pg_net is currently installed with extrelocatable=false and its functions live
-- in the net schema. It is intentionally not dropped/recreated during live hardening.
-- Leaked Password Protection must be enabled from Supabase Auth settings if the plan supports it.
