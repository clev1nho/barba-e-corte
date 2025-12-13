-- Add maps_link field to shop_settings
ALTER TABLE public.shop_settings 
ADD COLUMN IF NOT EXISTS maps_link text;