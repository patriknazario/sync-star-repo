-- =====================================================
-- CORREÇÕES DE SEGURANÇA
-- =====================================================

-- 1. CORRIGIR VIEWS: Remover SECURITY DEFINER implícito e adicionar SECURITY INVOKER
DROP VIEW IF EXISTS public.view_performance_vendedoras CASCADE;
DROP VIEW IF EXISTS public.view_stats_cursos CASCADE;

CREATE VIEW public.view_performance_vendedoras
WITH (security_invoker=on) AS
SELECT 
  v.id,
  v.nome,
  v.email,
  v.meta_anual,
  v.ano,
  COALESCE(SUM(COALESCE(l.valor_negociado, l.valor_proposta)), 0) as faturamento_realizado,
  COALESCE(SUM(l.quantidade_inscricoes), 0) as inscricoes_realizadas,
  COUNT(DISTINCT l.curso_id) as cursos_atendidos,
  COUNT(l.id) as total_leads,
  COUNT(CASE WHEN l.status = 'Inscrição Realizada' THEN 1 END) as leads_convertidos
FROM public.vendedoras v
LEFT JOIN public.leads l ON v.id = l.vendedora_id AND l.status = 'Inscrição Realizada'
GROUP BY v.id, v.nome, v.email, v.meta_anual, v.ano;

CREATE VIEW public.view_stats_cursos
WITH (security_invoker=on) AS
SELECT 
  c.id,
  c.nome,
  c.status,
  c.meta_inscricoes,
  c.valor_total,
  c.data_inicio,
  c.data_termino,
  public.get_inscricoes_curso(c.id) as inscricoes_realizadas,
  public.get_faturamento_curso(c.id) as faturamento_realizado,
  COUNT(l.id) as total_leads
FROM public.cursos c
LEFT JOIN public.leads l ON c.id = l.curso_id
GROUP BY c.id;

-- 2. CORRIGIR FUNÇÕES: Adicionar search_path
CREATE OR REPLACE FUNCTION public.get_faturamento_curso(curso_id_param BIGINT)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(COALESCE(valor_negociado, valor_proposta)), 0)
  FROM public.leads
  WHERE curso_id = curso_id_param AND status = 'Inscrição Realizada';
$$;

CREATE OR REPLACE FUNCTION public.get_inscricoes_curso(curso_id_param BIGINT)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(quantidade_inscricoes), 0)::INTEGER
  FROM public.leads
  WHERE curso_id = curso_id_param AND status = 'Inscrição Realizada';
$$;

CREATE OR REPLACE FUNCTION public.calc_realizado_ano(ano_param INTEGER)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(COALESCE(l.valor_negociado, l.valor_proposta)), 0)
  FROM public.leads l
  JOIN public.cursos c ON l.curso_id = c.id
  WHERE EXTRACT(YEAR FROM c.data_inicio) = ano_param 
    AND l.status = 'Inscrição Realizada';
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;