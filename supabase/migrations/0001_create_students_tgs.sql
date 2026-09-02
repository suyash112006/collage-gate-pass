-- 0001_create_students_tgs.sql

-- 1. Create tgs table
CREATE TABLE public.tgs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    teacher_id TEXT UNIQUE NOT NULL,
    department TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for tgs
ALTER TABLE public.tgs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "TGs can view own record" 
ON public.tgs FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "TGs can update own record" 
ON public.tgs FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Trigger to prevent TGs from modifying immutable fields
CREATE OR REPLACE FUNCTION public.protect_tg_immutable_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
        RAISE EXCEPTION 'Cannot modify user_id';
    END IF;
    IF NEW.teacher_id IS DISTINCT FROM OLD.teacher_id THEN
        RAISE EXCEPTION 'Cannot modify teacher_id';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_protect_tg_immutable_fields
BEFORE UPDATE ON public.tgs
FOR EACH ROW
EXECUTE FUNCTION public.protect_tg_immutable_fields();

-- 2. Create students table
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id TEXT UNIQUE NOT NULL,
    roll_no TEXT NOT NULL,
    department TEXT NOT NULL,
    year TEXT NOT NULL,
    division TEXT NOT NULL,
    tg_id UUID NULL REFERENCES public.tgs(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for students
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own record" 
ON public.students FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Students can update own record" 
ON public.students FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Trigger to prevent students from changing immutable fields and tg_id
CREATE OR REPLACE FUNCTION public.protect_student_immutable_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tg_id IS DISTINCT FROM OLD.tg_id THEN
        RAISE EXCEPTION 'Students cannot modify their TG assignment';
    END IF;
    IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
        RAISE EXCEPTION 'Cannot modify user_id';
    END IF;
    IF NEW.student_id IS DISTINCT FROM OLD.student_id THEN
        RAISE EXCEPTION 'Cannot modify student_id';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_protect_student_immutable_fields
BEFORE UPDATE ON public.students
FOR EACH ROW
EXECUTE FUNCTION public.protect_student_immutable_fields();

-- 3. Auto-update updated_at timestamps
CREATE TRIGGER tr_students_updated_at
BEFORE UPDATE ON public.students
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER tr_tgs_updated_at
BEFORE UPDATE ON public.tgs
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 4. Role consistency triggers
-- Ensure only 'student' role can be inserted into students table
CREATE OR REPLACE FUNCTION public.check_student_role()
RETURNS TRIGGER AS $$
DECLARE
    v_role TEXT;
BEGIN
    SELECT role INTO v_role FROM public.profiles WHERE id = NEW.user_id;
    IF v_role != 'student' THEN
        RAISE EXCEPTION 'Only users with student role can have a student record';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_check_student_role
BEFORE INSERT OR UPDATE ON public.students
FOR EACH ROW
EXECUTE FUNCTION public.check_student_role();

-- Ensure only 'tg' role can be inserted into tgs table
CREATE OR REPLACE FUNCTION public.check_tg_role()
RETURNS TRIGGER AS $$
DECLARE
    v_role TEXT;
BEGIN
    SELECT role INTO v_role FROM public.profiles WHERE id = NEW.user_id;
    IF v_role != 'tg' THEN
        RAISE EXCEPTION 'Only users with tg role can have a tg record';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_check_tg_role
BEFORE INSERT OR UPDATE ON public.tgs
FOR EACH ROW
EXECUTE FUNCTION public.check_tg_role();
