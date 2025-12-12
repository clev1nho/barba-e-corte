-- 1. Create service_categories table
CREATE TABLE IF NOT EXISTS public.service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on service_categories
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for service_categories
CREATE POLICY "Anyone can read service categories" 
  ON public.service_categories 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admin/Owner can manage categories" 
  ON public.service_categories 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

-- 2. Add category_id and subcategory to services table
ALTER TABLE public.services 
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.service_categories(id),
  ADD COLUMN IF NOT EXISTS subcategory text;

-- 3. Create gallery_images table
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  alt_text text,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on gallery_images
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- RLS policies for gallery_images
CREATE POLICY "Anyone can view gallery images" 
  ON public.gallery_images 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admin/Owner can manage gallery images" 
  ON public.gallery_images 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

-- 4. Update user_roles policies to include owner role check
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can read all roles" ON public.user_roles;

CREATE POLICY "Admins and owners can manage roles" 
  ON public.user_roles 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

CREATE POLICY "Admins and owners can read all roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

-- 5. Create helper functions for role checking
CREATE OR REPLACE FUNCTION public.is_admin_or_owner(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'owner')
  )
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'staff'
  )
$$;

-- 6. Update RLS for appointments to allow staff read/write
DROP POLICY IF EXISTS "Admin can manage appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins can read full appointments" ON public.appointments;
DROP POLICY IF EXISTS "Anyone can create appointments" ON public.appointments;

-- Owner/Admin full access
CREATE POLICY "Owner/Admin can manage appointments" 
  ON public.appointments 
  FOR ALL 
  USING (is_admin_or_owner(auth.uid()))
  WITH CHECK (is_admin_or_owner(auth.uid()));

-- Staff can view appointments
CREATE POLICY "Staff can view appointments" 
  ON public.appointments 
  FOR SELECT 
  USING (is_staff(auth.uid()));

-- Staff can update appointment status
CREATE POLICY "Staff can update appointments" 
  ON public.appointments 
  FOR UPDATE 
  USING (is_staff(auth.uid()));

-- Anyone can create appointments (public booking)
CREATE POLICY "Public can create appointments" 
  ON public.appointments 
  FOR INSERT 
  WITH CHECK (true);

-- 7. Create storage buckets for gallery and barbers photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('gallery', 'gallery', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('barbers', 'barbers', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for gallery bucket
CREATE POLICY "Public can view gallery images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery');

CREATE POLICY "Admin/Owner can upload to gallery"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'gallery' AND is_admin_or_owner(auth.uid()));

CREATE POLICY "Admin/Owner can update gallery"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'gallery' AND is_admin_or_owner(auth.uid()));

CREATE POLICY "Admin/Owner can delete from gallery"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'gallery' AND is_admin_or_owner(auth.uid()));

-- Storage policies for barbers bucket
CREATE POLICY "Public can view barber photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'barbers');

CREATE POLICY "Admin/Owner can upload barber photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'barbers' AND is_admin_or_owner(auth.uid()));

CREATE POLICY "Admin/Owner can update barber photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'barbers' AND is_admin_or_owner(auth.uid()));

CREATE POLICY "Admin/Owner can delete barber photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'barbers' AND is_admin_or_owner(auth.uid()));

-- 8. Seed service categories
INSERT INTO public.service_categories (name, display_order) VALUES
  ('Barbearia', 1),
  ('DEPILAÇÃO COM MÁQUINA', 2),
  ('DEPILAÇÃO COM CERA', 3),
  ('Massagens', 4),
  ('ESFOLIAÇÃO', 5)
ON CONFLICT (name) DO NOTHING;

-- 9. Update shop_settings with Care For Men branding
UPDATE public.shop_settings SET
  name = 'Care For Men',
  subtitle = 'Barbearia naturista premium focada em bem-estar e estética masculina',
  highlight_points = ARRAY[
    'Ambiente exclusivo e discreto',
    'Atendimento personalizado premium',
    'Massagens e tratamentos relaxantes',
    'Profissionais experientes'
  ]
WHERE id = (SELECT id FROM public.shop_settings LIMIT 1);