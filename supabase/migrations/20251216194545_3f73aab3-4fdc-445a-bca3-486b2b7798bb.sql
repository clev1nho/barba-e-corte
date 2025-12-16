-- Remove staff UPDATE permission on appointments (staff should only view, not edit)
DROP POLICY IF EXISTS "Staff can update all appointments" ON public.appointments;

-- Staff can only SELECT appointments, not update
-- Owner/Admin can still manage appointments via the existing "Owner/Admin can manage appointments" policy