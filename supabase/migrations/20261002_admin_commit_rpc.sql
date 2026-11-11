-- Allow authenticated browser clients to call the guarded commit RPC.
-- The function itself requires public.is_cs2_admin() (or service_role).
grant execute on function public.commit_cs2_state(bigint,jsonb,text,text,text,jsonb,text,uuid) to authenticated;
