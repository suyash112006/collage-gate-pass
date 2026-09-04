-- 0014_enable_realtime_students.sql

-- By default, Supabase creates a 'supabase_realtime' publication.
-- We explicitly add the students table so changes broadcast to clients.

ALTER PUBLICATION supabase_realtime ADD TABLE public.students;
