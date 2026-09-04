-- 0009_student_approval_system.sql

-- 1. Add status column to students table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'UNDER_REVIEW'
CHECK (status IN ('UNDER_REVIEW', 'APPROVED', 'DECLINED', 'BLOCKED'));

-- 2. Allow TGs to view and update their assigned students
DROP POLICY IF EXISTS "TGs can view assigned students" ON public.students;
CREATE POLICY "TGs can view assigned students" 
ON public.students FOR SELECT 
USING (tg_id IN (SELECT id FROM public.tgs WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "TGs can update assigned students" ON public.students;
CREATE POLICY "TGs can update assigned students" 
ON public.students FOR UPDATE 
USING (tg_id IN (SELECT id FROM public.tgs WHERE user_id = auth.uid()))
WITH CHECK (tg_id IN (SELECT id FROM public.tgs WHERE user_id = auth.uid()));

-- 3. Allow TGs to view profiles of their assigned students
DROP POLICY IF EXISTS "TGs can view profiles of assigned students" ON public.profiles;
CREATE POLICY "TGs can view profiles of assigned students" 
ON public.profiles FOR SELECT 
USING (
  role = 'student' AND 
  id IN (SELECT user_id FROM public.students WHERE tg_id IN (SELECT id FROM public.tgs WHERE user_id = auth.uid()))
);

-- 4. Create a secure view for fetching available TGs during signup
-- This exposes only the minimum required information (id, name, department)
CREATE OR REPLACE VIEW public.available_tgs AS
SELECT 
    t.id as tg_id,
    p.full_name,
    t.department
FROM public.tgs t
JOIN public.profiles p ON t.user_id = p.id
WHERE p.role = 'tg';

-- Grant select access to anon and authenticated users
GRANT SELECT ON public.available_tgs TO anon;
GRANT SELECT ON public.available_tgs TO authenticated;

-- 5. Update student trigger to prevent tampering with status
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
    
    -- Prevent students from modifying their own status
    IF auth.uid() = NEW.user_id THEN
        IF NEW.status IS DISTINCT FROM OLD.status THEN
            RAISE EXCEPTION 'Students cannot modify their own status';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
