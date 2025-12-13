-- Add hero background and footer configuration fields to shop_settings
ALTER TABLE public.shop_settings
ADD COLUMN IF NOT EXISTS hero_bg_desktop_url TEXT NULL,
ADD COLUMN IF NOT EXISTS hero_bg_mobile_url TEXT NULL,
ADD COLUMN IF NOT EXISTS hero_bg_desktop_position TEXT DEFAULT 'center',
ADD COLUMN IF NOT EXISTS hero_bg_mobile_position TEXT DEFAULT 'center',
ADD COLUMN IF NOT EXISTS footer_text TEXT NULL;