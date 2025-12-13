-- Add opening_hours text field for Hero display
ALTER TABLE public.shop_settings 
ADD COLUMN IF NOT EXISTS opening_hours TEXT DEFAULT NULL;