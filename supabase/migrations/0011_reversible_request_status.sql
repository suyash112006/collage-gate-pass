-- 0011_reversible_request_status.sql

CREATE OR REPLACE FUNCTION public.protect_gate_pass_update()
RETURNS TRIGGER AS $$
DECLARE
    v_role TEXT;
BEGIN
    SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();

    -- Explicitly reject non-TG roles (including students or NULL)
    IF v_role IS DISTINCT FROM 'tg' THEN
        RAISE EXCEPTION 'Only Teacher Guardians can update gate passes.';
    END IF;

    -- TG Validations
    -- (Removed restriction on OLD.status != 'pending' to allow reversible status)

    IF NEW.status NOT IN ('approved', 'declined') THEN
        RAISE EXCEPTION 'TGs can only approve or decline gate passes.';
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
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
