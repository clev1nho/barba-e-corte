
-- 1. Create barber_services junction table for barber-service relationships
CREATE TABLE public.barber_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  barber_id UUID NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(barber_id, service_id)
);

-- Enable RLS
ALTER TABLE public.barber_services ENABLE ROW LEVEL SECURITY;

-- RLS Policies for barber_services
CREATE POLICY "Anyone can read barber_services"
ON public.barber_services
FOR SELECT
USING (true);

CREATE POLICY "Owner can manage barber_services"
ON public.barber_services
FOR ALL
USING (is_admin_or_owner(auth.uid()))
WITH CHECK (is_admin_or_owner(auth.uid()));

-- 2. Add new fields to appointments for expanded client info
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS client_email TEXT,
ADD COLUMN IF NOT EXISTS client_birth_date DATE,
ADD COLUMN IF NOT EXISTS referral_source TEXT;

-- 3. Add service_ids array column to appointments for multiple services
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS service_ids UUID[] DEFAULT '{}';

-- 4. Add total_price and total_deposit columns
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS total_price NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_deposit NUMERIC DEFAULT 0;
