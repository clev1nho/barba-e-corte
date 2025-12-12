-- Drop existing policies on barbers
DROP POLICY IF EXISTS "Admin can manage all barbers" ON public.barbers;
DROP POLICY IF EXISTS "Anyone can read active barbers" ON public.barbers;

-- Drop existing policies on shop_settings
DROP POLICY IF EXISTS "Admin can manage shop settings" ON public.shop_settings;
DROP POLICY IF EXISTS "Anyone can read shop settings" ON public.shop_settings;

-- Drop existing policies on services
DROP POLICY IF EXISTS "Admin can manage all services" ON public.services;
DROP POLICY IF EXISTS "Anyone can read active services" ON public.services;

-- Drop existing policies on service_categories
DROP POLICY IF EXISTS "Admin/Owner can manage categories" ON public.service_categories;
DROP POLICY IF EXISTS "Anyone can read service categories" ON public.service_categories;

-- Recreate policies as PERMISSIVE (default) for barbers
CREATE POLICY "Owner can manage barbers" 
ON public.barbers 
FOR ALL 
TO authenticated
USING (is_admin_or_owner(auth.uid()))
WITH CHECK (is_admin_or_owner(auth.uid()));

CREATE POLICY "Anyone can read active barbers" 
ON public.barbers 
FOR SELECT 
TO anon, authenticated
USING (active = true);

-- Recreate policies as PERMISSIVE for shop_settings
CREATE POLICY "Owner can manage shop settings" 
ON public.shop_settings 
FOR ALL 
TO authenticated
USING (is_admin_or_owner(auth.uid()))
WITH CHECK (is_admin_or_owner(auth.uid()));

CREATE POLICY "Anyone can read shop settings" 
ON public.shop_settings 
FOR SELECT 
TO anon, authenticated
USING (true);

-- Recreate policies as PERMISSIVE for services
CREATE POLICY "Owner can manage services" 
ON public.services 
FOR ALL 
TO authenticated
USING (is_admin_or_owner(auth.uid()))
WITH CHECK (is_admin_or_owner(auth.uid()));

CREATE POLICY "Anyone can read active services" 
ON public.services 
FOR SELECT 
TO anon, authenticated
USING (active = true);

-- Recreate policies as PERMISSIVE for service_categories
CREATE POLICY "Owner can manage service categories" 
ON public.service_categories 
FOR ALL 
TO authenticated
USING (is_admin_or_owner(auth.uid()))
WITH CHECK (is_admin_or_owner(auth.uid()));

CREATE POLICY "Anyone can read service categories" 
ON public.service_categories 
FOR SELECT 
TO anon, authenticated
USING (true);