-- Create barber_commission_rates table for storing commission percentages per barber per category
CREATE TABLE IF NOT EXISTS public.barber_commission_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id uuid NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
  commission_percent numeric NOT NULL DEFAULT 0 CHECK (commission_percent >= 0 AND commission_percent <= 100),
  created_at timestamptz DEFAULT now(),
  UNIQUE (barber_id, category_id)
);

-- Enable RLS
ALTER TABLE public.barber_commission_rates ENABLE ROW LEVEL SECURITY;

-- Owner only can manage commission rates
CREATE POLICY "Owner can manage commission rates"
ON public.barber_commission_rates
FOR ALL
USING (is_admin_or_owner(auth.uid()))
WITH CHECK (is_admin_or_owner(auth.uid()));

-- Add payment_method_fees to shop_settings if not exists
ALTER TABLE public.shop_settings 
ADD COLUMN IF NOT EXISTS payment_method_fees jsonb NOT NULL DEFAULT '{"pix":0,"cash":0,"debit":0,"credit":0}'::jsonb;