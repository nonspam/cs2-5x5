-- DEV ONLY: allow the browser client to read the single public app-state row.
-- RLS remains enabled and the existing SELECT policy limits access to this state row.
GRANT SELECT ON TABLE public.cs2_app_state TO anon, authenticated;
