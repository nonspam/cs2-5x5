create or replace function public.claim_player_account_invite(p_token text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_invite_id uuid;
  v_player_id text;
  v_hash text;
begin
  if v_user is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  if p_token is null or length(trim(p_token)) < 24 or length(trim(p_token)) > 128 then
    raise exception 'invalid or expired invitation';
  end if;

  v_hash := encode(
    extensions.digest(convert_to(upper(trim(p_token)), 'UTF8'), 'sha256'),
    'hex'
  );

  select i.id, i.player_id
  into v_invite_id, v_player_id
  from private.player_account_invites i
  where i.token_hash = v_hash
    and i.claimed_at is null
    and i.revoked_at is null
    and i.expires_at > now()
  for update;

  if v_invite_id is null then
    raise exception 'invalid or expired invitation';
  end if;

  if not exists (
    select 1
    from public.cs2_app_state s
    cross join lateral jsonb_array_elements(s.state->'players') as p(value)
    where s.id = 1
      and p.value->>'player_id' = v_player_id
      and coalesce((p.value->>'is_active')::boolean, false) = true
      and p.value->>'status' = 'active'
      and exists (
        select 1 from public.player_profiles pp
        where pp.player_id = v_player_id
      )
  ) then
    raise exception 'player is no longer active';
  end if;

  if exists (
    select 1 from private.player_account_links l
    where l.auth_user_id = v_user or l.player_id = v_player_id
  ) then
    raise exception 'account or player is already linked';
  end if;

  insert into private.player_account_links(auth_user_id, player_id)
  values (v_user, v_player_id);

  update private.player_account_invites
  set claimed_by = v_user, claimed_at = now()
  where id = v_invite_id;

  return v_player_id;
end;
$$;

revoke all on function public.claim_player_account_invite(text) from public, anon;
grant execute on function public.claim_player_account_invite(text) to authenticated;
