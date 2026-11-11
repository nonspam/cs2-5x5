create or replace function private.list_unlinked_players_impl()
returns table(player_id text, display_name text)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.is_cs2_admin() then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  return query
  select p.value->>'player_id', p.value->>'display_name'
  from public.cs2_app_state s
  cross join lateral jsonb_array_elements(s.state->'players') as p(value)
  where s.id = 1
    and coalesce((p.value->>'is_active')::boolean, false) = true
    and p.value->>'status' = 'active'
    and exists (
      select 1 from public.player_profiles pp
      where pp.player_id = p.value->>'player_id'
    )
    and not exists (
      select 1 from private.player_account_links l
      where l.player_id = p.value->>'player_id'
    )
  order by p.value->>'display_name';
end;
$$;

create or replace function private.create_player_account_invite_impl(p_player_id text)
returns table(invite_token text, player_id text, expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_token text;
  v_expires timestamptz := now() + interval '7 days';
begin
  if v_user is null or not public.is_cs2_admin() then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  if p_player_id is null or length(trim(p_player_id)) = 0 then
    raise exception 'player_id is required';
  end if;

  if not exists (
    select 1
    from public.cs2_app_state s
    cross join lateral jsonb_array_elements(s.state->'players') as p(value)
    where s.id = 1
      and p.value->>'player_id' = p_player_id
      and coalesce((p.value->>'is_active')::boolean, false) = true
      and p.value->>'status' = 'active'
      and exists (
        select 1 from public.player_profiles pp
        where pp.player_id = p_player_id
      )
  ) then
    raise exception 'active player not found';
  end if;

  if exists (
    select 1 from private.player_account_links l
    where l.player_id = p_player_id
  ) then
    raise exception 'player already linked to an account';
  end if;

  update private.player_account_invites
  set revoked_at = now()
  where player_account_invites.player_id = p_player_id
    and claimed_at is null
    and revoked_at is null;

  v_token := upper(encode(extensions.gen_random_bytes(18), 'hex'));

  insert into private.player_account_invites(player_id, token_hash, created_by, expires_at)
  values (
    p_player_id,
    encode(extensions.digest(convert_to(v_token, 'UTF8'), 'sha256'), 'hex'),
    v_user,
    v_expires
  );

  return query select v_token, p_player_id, v_expires;
end;
$$;

create or replace function private.claim_player_account_invite_impl(p_token text)
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

create or replace function public.list_unlinked_players()
returns table(player_id text, display_name text)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.list_unlinked_players_impl();
$$;

create or replace function public.create_player_account_invite(p_player_id text)
returns table(invite_token text, player_id text, expires_at timestamptz)
language sql
security invoker
set search_path = ''
as $$
  select * from private.create_player_account_invite_impl(p_player_id);
$$;

create or replace function public.claim_player_account_invite(p_token text)
returns text
language sql
security invoker
set search_path = ''
as $$
  select private.claim_player_account_invite_impl(p_token);
$$;

grant usage on schema private to authenticated;

revoke all on function private.list_unlinked_players_impl() from public, anon;
revoke all on function private.create_player_account_invite_impl(text) from public, anon;
revoke all on function private.claim_player_account_invite_impl(text) from public, anon;
grant execute on function private.list_unlinked_players_impl() to authenticated;
grant execute on function private.create_player_account_invite_impl(text) to authenticated;
grant execute on function private.claim_player_account_invite_impl(text) to authenticated;

revoke all on function public.list_unlinked_players() from public, anon;
revoke all on function public.create_player_account_invite(text) from public, anon;
revoke all on function public.claim_player_account_invite(text) from public, anon;
grant execute on function public.list_unlinked_players() to authenticated;
grant execute on function public.create_player_account_invite(text) to authenticated;
grant execute on function public.claim_player_account_invite(text) to authenticated;
