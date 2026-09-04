-- 0012_enable_realtime_sync.sql

-- By default, Supabase creates a 'supabase_realtime' publication.
-- We must explicitly add our tables to it so changes broadcast to clients.

ALTER PUBLICATION supabase_realtime ADD TABLE public.gate_passes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
