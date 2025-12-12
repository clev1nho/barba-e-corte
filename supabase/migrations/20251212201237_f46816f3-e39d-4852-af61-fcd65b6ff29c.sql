-- Drop existing restrictive staff policies on appointments
DROP POLICY IF EXISTS "Staff can view appointments for their barber" ON public.appointments;
DROP POLICY IF EXISTS "Staff can update appointments for their barber" ON public.appointments;
DROP POLICY IF EXISTS "Staff can delete appointments for their barber" ON public.appointments;

-- Create new policies for staff to access all appointments (read and update for operational purposes)
CREATE POLICY "Staff can view all appointments"
ON public.appointments
FOR SELECT
USING (is_staff(auth.uid()));

CREATE POLICY "Staff can update all appointments"
ON public.appointments
FOR UPDATE
USING (is_staff(auth.uid()));

-- Staff should NOT be able to delete appointments (only owner/admin)
-- So we don't create a DELETE policy for staff