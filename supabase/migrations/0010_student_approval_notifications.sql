-- 0010_student_approval_notifications.sql

-- 1. Add student_id to notifications
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES public.students(id) ON DELETE CASCADE;

-- 2. Update type constraint
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('new_request', 'approved', 'declined', 'account_under_review', 'account_approved', 'account_declined', 'account_blocked', 'account_unblocked', 'new_student_request'));

-- 3. Update unique constraint
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS unique_notification_event;

-- We want to prevent duplicate notifications for the same event.
-- We can create a unique index that coalesces the IDs to handle nulls.
DROP INDEX IF EXISTS unique_notification_event_idx;
CREATE UNIQUE INDEX unique_notification_event_idx 
ON public.notifications (
    user_id, 
    type, 
    COALESCE(gate_pass_id, '00000000-0000-0000-0000-000000000000'::uuid),
    COALESCE(student_id, '00000000-0000-0000-0000-000000000000'::uuid)
);

-- 4. Update the immutability trigger for updates
CREATE OR REPLACE FUNCTION public.protect_notification_update()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_id IS DISTINCT FROM OLD.user_id OR 
       NEW.gate_pass_id IS DISTINCT FROM OLD.gate_pass_id OR 
       NEW.student_id IS DISTINCT FROM OLD.student_id OR 
       NEW.type IS DISTINCT FROM OLD.type OR 
       NEW.title IS DISTINCT FROM OLD.title OR 
       NEW.message IS DISTINCT FROM OLD.message OR 
       NEW.created_at IS DISTINCT FROM OLD.created_at THEN
        RAISE EXCEPTION 'Only is_read can be updated on a notification.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION public.protect_notification_update() FROM PUBLIC;
