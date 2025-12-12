-- Add logo_url column to shop_settings
ALTER TABLE public.shop_settings 
ADD COLUMN IF NOT EXISTS logo_url text;

-- Create logos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for logos bucket
-- Owner/Admin can manage logos
CREATE POLICY "Owner can manage logos"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'logos' 
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role) 
    OR public.has_role(auth.uid(), 'owner'::public.app_role)
  )
)
WITH CHECK (
  bucket_id = 'logos' 
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role) 
    OR public.has_role(auth.uid(), 'owner'::public.app_role)
  )
);

-- Staff can upload logos
CREATE POLICY "Staff can upload logos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'logos' 
  AND public.has_role(auth.uid(), 'staff'::public.app_role)
);

-- Staff can update logos
CREATE POLICY "Staff can update logos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'logos' 
  AND public.has_role(auth.uid(), 'staff'::public.app_role)
);

-- Public can view logos
CREATE POLICY "Public can view logos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'logos');