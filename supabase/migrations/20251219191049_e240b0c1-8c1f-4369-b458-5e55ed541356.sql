-- Criar tabela home_cards
CREATE TABLE public.home_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text NULL,
  image_url text NULL,
  link_url text NOT NULL,
  icon_key text NOT NULL DEFAULT 'message',
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índice para busca de cards ativos ordenados
CREATE INDEX idx_home_cards_active_order ON public.home_cards (is_active, display_order);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_home_cards_updated_at
  BEFORE UPDATE ON public.home_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS
ALTER TABLE public.home_cards ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública: apenas cards ativos
CREATE POLICY "Anyone can view active home cards"
  ON public.home_cards
  FOR SELECT
  USING (is_active = true);

-- Política de escrita: apenas owner pode gerenciar (usa função existente)
CREATE POLICY "Owner can manage home cards"
  ON public.home_cards
  FOR ALL
  USING (is_admin_or_owner(auth.uid()))
  WITH CHECK (is_admin_or_owner(auth.uid()));