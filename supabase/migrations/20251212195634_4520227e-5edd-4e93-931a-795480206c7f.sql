-- Add barber_id column to user_roles for staff → barber link
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS barber_id uuid REFERENCES public.barbers(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_barber_id ON public.user_roles(barber_id);

-- Update RLS for appointments: staff can only see/manage appointments for their linked barber
DROP POLICY IF EXISTS "Staff can view appointments" ON public.appointments;
DROP POLICY IF EXISTS "Staff can update appointments" ON public.appointments;

-- Staff can view appointments only for their linked barber
CREATE POLICY "Staff can view appointments for their barber"
ON public.appointments
FOR SELECT
USING (
  is_staff(auth.uid()) AND 
  barber_id = (SELECT barber_id FROM public.user_roles WHERE user_id = auth.uid() AND role = 'staff' LIMIT 1)
);

-- Staff can update appointments only for their linked barber
CREATE POLICY "Staff can update appointments for their barber"
ON public.appointments
FOR UPDATE
USING (
  is_staff(auth.uid()) AND 
  barber_id = (SELECT barber_id FROM public.user_roles WHERE user_id = auth.uid() AND role = 'staff' LIMIT 1)
);

-- Staff can delete appointments only for their linked barber
CREATE POLICY "Staff can delete appointments for their barber"
ON public.appointments
FOR DELETE
USING (
  is_staff(auth.uid()) AND 
  barber_id = (SELECT barber_id FROM public.user_roles WHERE user_id = auth.uid() AND role = 'staff' LIMIT 1)
);