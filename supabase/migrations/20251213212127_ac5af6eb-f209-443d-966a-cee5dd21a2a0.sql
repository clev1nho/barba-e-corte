-- Add crop fields for hero background positioning (percentage-based)
ALTER TABLE public.shop_settings 
ADD COLUMN IF NOT EXISTS hero_bg_desktop_crop_x FLOAT DEFAULT 50,
ADD COLUMN IF NOT EXISTS hero_bg_desktop_crop_y FLOAT DEFAULT 50,
ADD COLUMN IF NOT EXISTS hero_bg_mobile_crop_x FLOAT DEFAULT 50,
ADD COLUMN IF NOT EXISTS hero_bg_mobile_crop_y FLOAT DEFAULT 50;

-- Add comment for clarity
COMMENT ON COLUMN public.shop_settings.hero_bg_desktop_crop_x IS 'Crop X position for desktop hero bg (0-100%)';
COMMENT ON COLUMN public.shop_settings.hero_bg_desktop_crop_y IS 'Crop Y position for desktop hero bg (0-100%)';
COMMENT ON COLUMN public.shop_settings.hero_bg_mobile_crop_x IS 'Crop X position for mobile hero bg (0-100%)';
COMMENT ON COLUMN public.shop_settings.hero_bg_mobile_crop_y IS 'Crop Y position for mobile hero bg (0-100%)';