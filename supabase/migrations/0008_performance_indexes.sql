-- 0008_performance_indexes.sql

-- Index for Student Gate Pass History
-- Improves: .eq('student_id', studentData.id).order('created_at', { ascending: false })
CREATE INDEX IF NOT EXISTS idx_gate_passes_student_created
ON public.gate_passes(student_id, created_at DESC);

-- Index for TG Dashboard and Requests Filtering
-- Improves: .eq('tg_id', tgId).eq('status', 'pending') and .gte('created_at', ...)
CREATE INDEX IF NOT EXISTS idx_gate_passes_tg_status_created
ON public.gate_passes(tg_id, status, created_at DESC);

-- Index for Notifications
-- Improves: .eq('user_id', authData.user.id).eq('is_read', false) and .order('created_at', { ascending: false })
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created
ON public.notifications(user_id, is_read, created_at DESC);

-- Index for TG's Students
-- Improves: .eq('tg_id', tgData.id) in getTgStudents
CREATE INDEX IF NOT EXISTS idx_students_tg_id
ON public.students(tg_id);
