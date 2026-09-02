-- 0005_fix_gate_pass_notification_trigger.sql

-- 1. Drop the existing BEFORE INSERT trigger
DROP TRIGGER IF EXISTS tr_protect_gate_pass_insert ON public.gate_passes;

-- 2. Recreate the trigger using AFTER INSERT
-- We reuse the existing protect_gate_pass_insert() function which is already SECURITY DEFINER.
CREATE TRIGGER tr_protect_gate_pass_insert
AFTER INSERT ON public.gate_passes
FOR EACH ROW
EXECUTE FUNCTION public.protect_gate_pass_insert();
