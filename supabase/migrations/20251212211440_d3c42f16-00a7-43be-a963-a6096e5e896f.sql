-- Add editable text fields to shop_settings
ALTER TABLE public.shop_settings
ADD COLUMN IF NOT EXISTS hero_secondary_text text DEFAULT 'Agendamento online, rápido e sem precisar mandar mensagem.',
ADD COLUMN IF NOT EXISTS about_description text DEFAULT 'Nossa barbearia oferece uma experiência única em cuidados masculinos. Combinamos técnicas tradicionais com tendências modernas para entregar cortes impecáveis e atendimento de primeira classe.';