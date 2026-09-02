-- 0007_allow_teacher_id_edit.sql

-- Modify the trigger to only prevent user_id from changing.
-- We remove the check for teacher_id so that TGs can update their teacher_id later.
CREATE OR REPLACE FUNCTION public.protect_tg_immutable_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
        RAISE EXCEPTION 'Cannot modify user_id';
    END IF;
    -- The check for teacher_id has been intentionally removed
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
