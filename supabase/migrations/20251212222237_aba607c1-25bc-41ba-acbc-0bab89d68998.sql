-- Add new columns to service_categories for homepage customization
ALTER TABLE public.service_categories 
ADD COLUMN IF NOT EXISTS icon_image_url text,
ADD COLUMN IF NOT EXISTS home_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Add section title/subtitle to shop_settings
ALTER TABLE public.shop_settings 
ADD COLUMN IF NOT EXISTS services_section_title text DEFAULT 'Nossos Serviços',
ADD COLUMN IF NOT EXISTS services_section_subtitle text DEFAULT 'Cuidados especializados para o homem moderno';

-- Create storage bucket for service icons
INSERT INTO storage.buckets (id, name, public) 
VALUES ('service-icons', 'service-icons', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for service-icons bucket
CREATE POLICY "Anyone can view service icons"
ON storage.objects FOR SELECT
USING (bucket_id = 'service-icons');

CREATE POLICY "Owner can manage service icons"
ON storage.objects FOR ALL
USING (bucket_id = 'service-icons' AND is_admin_or_owner(auth.uid()))
WITH CHECK (bucket_id = 'service-icons' AND is_admin_or_owner(auth.uid()));

-- Update trigger for updated_at on service_categories
CREATE TRIGGER update_service_categories_updated_at
BEFORE UPDATE ON public.service_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();