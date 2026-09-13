create or replace function public.sale_set_outcome(p_request_id uuid, p_result text)
returns table(request_id uuid, seller_result text, dealer_result text, final_state text)
language plpgsql
security definer
set search_path to 'public', 'auth'
as $function$
declare
  v_uid uuid := auth.uid();
  v_request public.dealer_sell_requests%rowtype;
  v_offer public.dealer_offers%rowtype;
  v_row public.dealer_sale_outcomes%rowtype;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if p_result not in ('completed','not_completed') then raise exception 'INVALID_RESULT'; end if;

  select r.* into v_request
  from public.dealer_sell_requests r
  where r.id = p_request_id
  for update;
  if v_request.id is null then raise exception 'REQUEST_NOT_FOUND'; end if;
  if v_request.status not in ('accepted','completed') then raise exception 'REQUEST_NOT_ACCEPTED'; end if;
  if v_request.accepted_offer_id is null then raise exception 'NO_ACCEPTED_OFFER'; end if;

  select o.* into v_offer
  from public.dealer_offers o
  where o.id = v_request.accepted_offer_id and o.status = 'accepted';
  if v_offer.id is null then raise exception 'OFFER_NOT_FOUND'; end if;

  if v_uid <> v_request.user_id and v_uid <> v_offer.dealer_id and not public.is_admin() then
    raise exception 'FORBIDDEN';
  end if;

  insert into public.dealer_sale_outcomes(request_id, seller_id, dealer_id)
  values(v_request.id, v_request.user_id, v_offer.dealer_id)
  on conflict on constraint dealer_sale_outcomes_pkey do nothing;

  if v_uid = v_request.user_id then
    update public.dealer_sale_outcomes s
       set seller_result = p_result,
           seller_updated_at = now(),
           updated_at = now()
     where s.request_id = v_request.id;
  elsif v_uid = v_offer.dealer_id then
    update public.dealer_sale_outcomes s
       set dealer_result = p_result,
           dealer_updated_at = now(),
           updated_at = now()
     where s.request_id = v_request.id;
  elsif public.is_admin() then
    update public.dealer_sale_outcomes s
       set seller_result = p_result,
           seller_updated_at = now(),
           updated_at = now()
     where s.request_id = v_request.id;
  end if;

  select * into v_row
  from public.dealer_sale_outcomes s
  where s.request_id = v_request.id;

  if v_row.seller_result = 'completed' and v_row.dealer_result = 'completed' then
    update public.dealer_sell_requests r
       set status = 'completed', updated_at = now()
     where r.id = v_request.id;
  elsif v_request.status = 'completed' then
    update public.dealer_sell_requests r
       set status = 'accepted', updated_at = now()
     where r.id = v_request.id;
  end if;

  return query
  select v_row.request_id,
         v_row.seller_result,
         v_row.dealer_result,
         case
           when v_row.seller_result = 'completed' and v_row.dealer_result = 'completed' then 'completed'
           when v_row.seller_result = 'not_completed' and v_row.dealer_result = 'not_completed' then 'not_completed'
           when v_row.seller_result is not null and v_row.dealer_result is not null and v_row.seller_result <> v_row.dealer_result then 'disputed'
           when v_row.seller_result is not null or v_row.dealer_result is not null then 'waiting_other'
           else 'pending'
         end;
end;
$function$;
