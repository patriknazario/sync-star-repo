-- Adicionar coluna meta_mensal à tabela vendedoras
ALTER TABLE public.vendedoras 
ADD COLUMN IF NOT EXISTS meta_mensal NUMERIC NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.vendedoras.meta_mensal IS 'Meta mensal de faturamento da vendedora';