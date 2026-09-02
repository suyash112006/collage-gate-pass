-- 0003_notifications.sql

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    gate_pass_id UUID REFERENCES public.gate_passes(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('new_request', 'approved', 'declined')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_notification_event UNIQUE(gate_pass_id, type, user_id)
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 1. Users can view their own notifications
CREATE POLICY "Users view own notifications" 
ON public.notifications FOR SELECT 
USING (user_id = auth.uid());

-- 2. Users can mark their own notifications as read
CREATE POLICY "Users update own notifications" 
ON public.notifications FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 3. Immutability trigger for updates
CREATE OR REPLACE FUNCTION public.protect_notification_update()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_id IS DISTINCT FROM OLD.user_id OR 
       NEW.gate_pass_id IS DISTINCT FROM OLD.gate_pass_id OR 
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

CREATE TRIGGER tr_protect_notification_update
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.protect_notification_update();


-- Modify the INSERT trigger for gate_passes to create a notification for the TG
CREATE OR REPLACE FUNCTION public.protect_gate_pass_insert()
RETURNS TRIGGER AS $$
DECLARE
    v_actual_tg_id UUID;
    v_student_user_id UUID;
    v_tg_user_id UUID;
    v_student_name TEXT;
BEGIN
    -- Fetch the student's assigned TG, user_id ownership, and name
    SELECT s.tg_id, s.user_id, p.full_name 
    INTO v_actual_tg_id, v_student_user_id, v_student_name
    FROM public.students s
    JOIN public.profiles p ON p.id = s.user_id
    WHERE s.id = NEW.student_id;
    
    -- Check 1: Proof of ownership
    IF v_student_user_id != auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized: student_id does not belong to the authenticated user.';
    END IF;

    -- Check 2: TG Assignment existence
    IF v_actual_tg_id IS NULL THEN
        RAISE EXCEPTION 'No Teacher Guardian assigned. Cannot create gate pass.';
    END IF;

    -- Check 3: TG Spoofer protection
    IF NEW.tg_id != v_actual_tg_id THEN
        RAISE EXCEPTION 'Unauthorized: Cannot assign gate pass to an unauthorized TG.';
    END IF;

    -- Check 4: Status must strictly be pending
    IF NEW.status != 'pending' THEN
        RAISE EXCEPTION 'New gate passes must have a pending status.';
    END IF;

    -- Check 5: Prevent TG remark on creation
    IF NEW.tg_remark IS NOT NULL THEN
        RAISE EXCEPTION 'TG remark cannot be set when creating a gate pass.';
    END IF;

    -- Fetch the TG's user_id for the notification
    SELECT user_id INTO v_tg_user_id FROM public.tgs WHERE id = NEW.tg_id;

    -- Insert notification for the TG
    IF v_tg_user_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, gate_pass_id, type, title, message)
        VALUES (
            v_tg_user_id, 
            NEW.id, 
            'new_request', 
            'New Gate Pass Request', 
            COALESCE(v_student_name, 'A student') || ' has submitted a new gate pass request.'
        ) ON CONFLICT (gate_pass_id, type, user_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION public.protect_gate_pass_insert() FROM PUBLIC;


-- Modify the UPDATE trigger for gate_passes to create a notification for the Student
CREATE OR REPLACE FUNCTION public.protect_gate_pass_update()
RETURNS TRIGGER AS $$
DECLARE
    v_role TEXT;
    v_student_user_id UUID;
BEGIN
    SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();

    -- Explicitly reject non-TG roles (including students or NULL)
    IF v_role IS DISTINCT FROM 'tg' THEN
        RAISE EXCEPTION 'Only Teacher Guardians can update gate passes.';
    END IF;

    -- TG Validations
    IF OLD.status != 'pending' THEN
        RAISE EXCEPTION 'Cannot modify a gate pass that is already finalized.';
    END IF;

    IF NEW.status NOT IN ('approved', 'declined') THEN
        RAISE EXCEPTION 'TGs can only approve or decline pending gate passes.';
    END IF;

    IF NEW.status = 'approved' AND NEW.tg_remark IS NOT NULL THEN
        RAISE EXCEPTION 'Approved gate passes cannot contain a TG remark.';
    END IF;

    IF NEW.student_id != OLD.student_id OR 
       NEW.tg_id != OLD.tg_id OR 
       NEW.reason != OLD.reason OR 
       NEW.destination != OLD.destination OR 
       NEW.pass_date != OLD.pass_date OR 
       NEW.leaving_time != OLD.leaving_time OR 
       NEW.expected_return_time != OLD.expected_return_time OR 
       NEW.additional_info IS DISTINCT FROM OLD.additional_info THEN
        RAISE EXCEPTION 'TGs can only modify status and tg_remark. All other fields are immutable.';
    END IF;

    NEW.updated_at = NOW();

    -- Check if status actually transitioned from pending to approved/declined
    IF OLD.status = 'pending' AND NEW.status IN ('approved', 'declined') AND NEW.status <> OLD.status THEN
        -- Fetch the Student's user_id for the notification
        SELECT user_id INTO v_student_user_id FROM public.students WHERE id = NEW.student_id;

        -- Insert notification for the Student
        IF v_student_user_id IS NOT NULL THEN
            IF NEW.status = 'approved' THEN
                INSERT INTO public.notifications (user_id, gate_pass_id, type, title, message)
                VALUES (
                    v_student_user_id, 
                    NEW.id, 
                    'approved', 
                    'Gate Pass Approved', 
                    'Your gate pass request has been approved.'
                ) ON CONFLICT (gate_pass_id, type, user_id) DO NOTHING;
            ELSIF NEW.status = 'declined' THEN
                INSERT INTO public.notifications (user_id, gate_pass_id, type, title, message)
                VALUES (
                    v_student_user_id, 
                    NEW.id, 
                    'declined', 
                    'Gate Pass Declined', 
                    'Your gate pass request was declined.' || COALESCE(' Remark: ' || NEW.tg_remark, '')
                ) ON CONFLICT (gate_pass_id, type, user_id) DO NOTHING;
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION public.protect_gate_pass_update() FROM PUBLIC;
