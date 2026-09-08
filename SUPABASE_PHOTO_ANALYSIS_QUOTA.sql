-- KaçaGider FAZ 8 — AI fotoğraf analizi anonim kota
-- Görseller/veri burada saklanmaz. Yalnızca geri döndürülemez ziyaretçi özeti + gün + kullanım sayısı tutulur.
create table if not exists public.ai_photo_usage(
  visitor_hash text not null,
  usage_day date not null,
  used integer not null default 0 check(used>=0),
  updated_at timestamptz not null default now(),
  primary key(visitor_hash,usage_day)
);
alter table public.ai_photo_usage enable row level security;

create or replace function public.kg_consume_photo_analysis_quota(
  p_visitor_hash text,
  p_usage_day date,
  p_limit integer default 2
)
returns table(allowed boolean,used integer,remaining integer)
language plpgsql
security definer
set search_path=public
as $$
declare v_used integer; v_allowed boolean;
begin
  if length(coalesce(p_visitor_hash,''))<32 then raise exception 'invalid_visitor'; end if;
  p_limit:=greatest(1,least(coalesce(p_limit,2),10));
  select u.used into v_used from public.ai_photo_usage u where u.visitor_hash=p_visitor_hash and u.usage_day=p_usage_day for update;
  if coalesce(v_used,0)>=p_limit then
    return query select false,coalesce(v_used,0),0;
    return;
  end if;
  insert into public.ai_photo_usage(visitor_hash,usage_day,used,updated_at)
  values(p_visitor_hash,p_usage_day,1,now())
  on conflict(visitor_hash,usage_day) do update set used=public.ai_photo_usage.used+1,updated_at=now()
  returning ai_photo_usage.used into v_used;
  v_allowed:=v_used<=p_limit;
  return query select v_allowed,v_used,greatest(0,p_limit-v_used);
end;
$$;
revoke all on function public.kg_consume_photo_analysis_quota(text,date,integer) from public;
grant execute on function public.kg_consume_photo_analysis_quota(text,date,integer) to service_role;
