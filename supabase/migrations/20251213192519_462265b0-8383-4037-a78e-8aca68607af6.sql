-- Add PIX configuration fields to shop_settings
ALTER TABLE public.shop_settings
ADD COLUMN IF NOT EXISTS pix_key_or_link text,
ADD COLUMN IF NOT EXISTS pix_message text DEFAULT 'Envie o sinal e depois marque o checkbox para confirmar.',
ADD COLUMN IF NOT EXISTS pix_note text;

-- Add deposit_amount to services
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS deposit_amount numeric DEFAULT 0;