-- ============================================
-- CORREÇÃO DE SEGURANÇA: Views com Security Invoker
-- ============================================

-- Remover views antigas
drop view if exists public.view_performance_vendedoras;
drop view if exists public.view_stats_cursos;

-- Recriar views com security_invoker = true para respeitar RLS
create or replace view public.view_performance_vendedoras
with (security_invoker = true)
as
select 
  v.id,
  v.nome,
  v.email,
  v.meta_mensal,
  v.meta_anual,
  count(distinct l.id) as total_leads,
  count(distinct case when l.status = 'Inscrição Realizada' then l.id end) as leads_convertidos,
  coalesce(sum(case when l.status = 'Inscrição Realizada' then l.quantidade_inscricoes else 0 end), 0) as total_inscricoes,
  coalesce(sum(case when l.status = 'Inscrição Realizada' then coalesce(l.valor_negociado, l.valor_proposta) else 0 end), 0) as faturamento_total,
  round(
    case 
      when count(l.id) > 0 
      then (count(case when l.status = 'Inscrição Realizada' then 1 end)::numeric / count(l.id)::numeric) * 100
      else 0
    end, 
    2
  ) as taxa_conversao
from public.vendedoras v
left join public.leads l on l.vendedora_id = v.id
group by v.id, v.nome, v.email, v.meta_mensal, v.meta_anual;

-- View de estatísticas de cursos
create or replace view public.view_stats_cursos
with (security_invoker = true)
as
select 
  c.id,
  c.tema,
  c.cidade,
  c.estado,
  c.data_inicio,
  c.data_termino,
  c.status,
  c.valor_inscricao,
  p.nome as professor_nome,
  count(distinct l.id) as total_leads,
  coalesce(sum(case when l.status = 'Inscrição Realizada' then l.quantidade_inscricoes else 0 end), 0) as inscricoes,
  coalesce(sum(case when l.status = 'Inscrição Realizada' then coalesce(l.valor_negociado, l.valor_proposta) else 0 end), 0) as faturamento
from public.cursos c
left join public.professores p on p.id = c.professor_id
left join public.leads l on l.curso_id = c.id
group by c.id, c.tema, c.cidade, c.estado, c.data_inicio, c.data_termino, c.status, c.valor_inscricao, p.nome;