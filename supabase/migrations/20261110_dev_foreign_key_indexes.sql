-- DEV ONLY: indexes supporting the two foreign-key lookup paths flagged by Supabase.
create index if not exists idx_app_login_aliases_email
  on public.app_login_aliases (email);

create index if not exists idx_cs2_app_state_updated_by
  on public.cs2_app_state (updated_by)
  where updated_by is not null;
