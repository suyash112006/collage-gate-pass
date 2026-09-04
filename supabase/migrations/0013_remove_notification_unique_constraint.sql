-- 0013_remove_notification_unique_constraint.sql

-- Drop the unique constraint so that reversible actions (like PENDING -> APPROVED -> DECLINED -> APPROVED)
-- can generate multiple notifications of the same type for the same gate pass.
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS unique_notification_event;
