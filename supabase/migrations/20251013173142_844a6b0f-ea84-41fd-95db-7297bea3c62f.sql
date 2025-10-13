-- ============================================
-- CORREÇÃO DE SEGURANÇA: Search Path nas Functions
-- ============================================

-- Recriar funções de cálculo com search_path definido

-- Calcular inscrições de um curso
create or replace function public.get_inscricoes_curso(_curso_id uuid)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(quantidade_inscricoes), 0)
  from public.leads
  where curso_id = _curso_id
    and status = 'Inscrição Realizada'
$$;

-- Calcular faturamento de um curso
create or replace function public.get_faturamento_curso(_curso_id uuid)
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(coalesce(valor_negociado, valor_proposta)), 0)
  from public.leads
  where curso_id = _curso_id
    and status = 'Inscrição Realizada'
$$;

-- Calcular realizado de um ano
create or replace function public.calc_realizado_ano(_ano integer)
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(coalesce(valor_negociado, valor_proposta)), 0)
  from public.leads
  where status = 'Inscrição Realizada'
    and extract(year from data_conversao) = _ano
$$;

-- Obter taxa de comissão (com hierarquia)
create or replace function public.get_taxa_comissao(
  _vendedora_id uuid,
  _curso_id uuid
)
returns numeric
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  _taxa numeric;
begin
  -- 1. Específica (vendedora + curso)
  select taxa into _taxa
  from public.taxas_comissao
  where vendedora_id = _vendedora_id
    and curso_id = _curso_id
  limit 1;
  
  if _taxa is not null then
    return _taxa;
  end if;
  
  -- 2. Por vendedora
  select taxa into _taxa
  from public.taxas_comissao
  where vendedora_id = _vendedora_id
    and curso_id is null
  limit 1;
  
  if _taxa is not null then
    return _taxa;
  end if;
  
  -- 3. Por curso
  select taxa into _taxa
  from public.taxas_comissao
  where vendedora_id is null
    and curso_id = _curso_id
  limit 1;
  
  if _taxa is not null then
    return _taxa;
  end if;
  
  -- 4. Padrão
  select taxa into _taxa
  from public.taxas_comissao
  where vendedora_id is null
    and curso_id is null
  limit 1;
  
  return coalesce(_taxa, 0);
end;
$$;

-- Função genérica para atualizar updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;