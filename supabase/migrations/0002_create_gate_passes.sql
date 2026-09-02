-- 0002_create_gate_passes.sql

CREATE TABLE public.gate_passes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    tg_id UUID NOT NULL REFERENCES public.tgs(id) ON DELETE RESTRICT,
    reason TEXT NOT NULL,
    destination TEXT NOT NULL,
    pass_date DATE NOT NULL,
    leaving_time TIME NOT NULL,
    expected_return_time TIME NOT NULL,
    additional_info TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
    tg_remark TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Validate expected return time > leaving time at DB level
ALTER TABLE public.gate_passes 
ADD CONSTRAINT check_time_logic CHECK (expected_return_time > leaving_time);

ALTER TABLE public.gate_passes ENABLE ROW LEVEL SECURITY;

-- 1. Students can view their own passes
CREATE POLICY "Students view own passes" 
ON public.gate_passes FOR SELECT 
USING (
    student_id IN (
        SELECT id FROM public.students WHERE user_id = auth.uid()
    )
);

-- 2. TGs can view passes assigned to them
CREATE POLICY "TGs view assigned passes" 
ON public.gate_passes FOR SELECT 
USING (
    tg_id IN (
        SELECT id FROM public.tgs WHERE user_id = auth.uid()
    )
);

-- 3. Students can insert own passes
CREATE POLICY "Students insert own passes" 
ON public.gate_passes FOR INSERT 
WITH CHECK (
    student_id IN (
        SELECT id FROM public.students WHERE user_id = auth.uid()
    )
);

-- 4. TGs can update passes assigned to them
CREATE POLICY "TGs update assigned passes" 
ON public.gate_passes FOR UPDATE 
USING (
    tg_id IN (
        SELECT id FROM public.tgs WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    tg_id IN (
        SELECT id FROM public.tgs WHERE user_id = auth.uid()
    )
);

-- 5. Strict Insert Trigger
CREATE OR REPLACE FUNCTION public.protect_gate_pass_insert()
RETURNS TRIGGER AS $$
DECLARE
    v_actual_tg_id UUID;
    v_student_user_id UUID;
BEGIN
    -- Fetch the student's assigned TG and user_id ownership
    SELECT tg_id, user_id INTO v_actual_tg_id, v_student_user_id 
    FROM public.students 
    WHERE id = NEW.student_id;
    
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

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER tr_protect_gate_pass_insert
BEFORE INSERT ON public.gate_passes
FOR EACH ROW
EXECUTE FUNCTION public.protect_gate_pass_insert();

-- 6. Strict Update Trigger
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
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER tr_protect_gate_pass_update
BEFORE UPDATE ON public.gate_passes
FOR EACH ROW
EXECUTE FUNCTION public.protect_gate_pass_update();
