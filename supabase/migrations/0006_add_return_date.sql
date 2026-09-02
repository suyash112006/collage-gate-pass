-- 0006_add_return_date.sql

-- 1. Redefine the trigger function FIRST so it allows system migrations to update the table
--    We also add return_date to the immutability checks here.
CREATE OR REPLACE FUNCTION public.protect_gate_pass_update()
RETURNS TRIGGER AS $$
DECLARE
    v_role TEXT;
BEGIN
    -- Allow system/service_role (where auth.uid() is null) to bypass these UI restrictions
    IF auth.uid() IS NULL THEN
        NEW.updated_at = NOW();
        RETURN NEW;
    END IF;

    SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();

    -- Explicitly reject non-TG roles
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

    -- Enforce immutability (now including return_date, which is added below)
    -- We use a safe check in case return_date doesn't exist yet during the first execution
    IF NEW.student_id != OLD.student_id OR 
       NEW.tg_id != OLD.tg_id OR 
       NEW.reason != OLD.reason OR 
       NEW.destination != OLD.destination OR 
       NEW.pass_date != OLD.pass_date OR 
       NEW.leaving_time != OLD.leaving_time OR 
       (NEW ? 'return_date' AND NEW.return_date != OLD.return_date) OR 
       NEW.expected_return_time != OLD.expected_return_time OR 
       NEW.additional_info IS DISTINCT FROM OLD.additional_info THEN
        RAISE EXCEPTION 'TGs can only modify status and tg_remark. All other fields are immutable.';
    END IF;

    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Add return_date column (allow null temporarily to backfill)
ALTER TABLE public.gate_passes ADD COLUMN return_date DATE;

-- 3. Backfill return_date with pass_date
-- Since auth.uid() is null for this migration script, the trigger bypass will allow this!
UPDATE public.gate_passes SET return_date = pass_date;

-- 4. Make return_date NOT NULL
ALTER TABLE public.gate_passes ALTER COLUMN return_date SET NOT NULL;

-- 5. Replace the old time logic constraint with a robust multi-day constraint
ALTER TABLE public.gate_passes DROP CONSTRAINT IF EXISTS check_time_logic;
ALTER TABLE public.gate_passes 
ADD CONSTRAINT check_time_logic 
CHECK (
    return_date > pass_date 
    OR (return_date = pass_date AND expected_return_time > leaving_time)
);
