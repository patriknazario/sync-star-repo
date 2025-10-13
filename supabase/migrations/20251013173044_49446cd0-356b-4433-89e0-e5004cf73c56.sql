-- ============================================
-- PARTE 1: ENUMs
-- ============================================

-- ENUM para tipos de roles
create type public.app_role as enum ('admin', 'vendedora', 'gerente', 'visualizador');

-- ENUM para status do curso
create type public.curso_status as enum (
  'Planejado', 
  'Inscrições Abertas', 
  'Em Andamento', 
  'Concluído', 
  'Cancelado'
);

-- ENUMs para status e motivo de perda
create type public.lead_status as enum (
  'Proposta Enviada', 
  'Inscrição Realizada', 
  'Proposta Declinada'
);

create type public.motivo_perda as enum (
  'Preço', 
  'Data do curso incompatível', 
  'Sem orçamento'
);

create type public.taxa_tipo as enum ('Padrão', 'Específica');

-- ============================================
-- PARTE 2: TABELAS PRINCIPAIS
-- ============================================

-- Tabela de perfis dos usuários
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  nome text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabela de roles de usuários
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz default now(),
  unique (user_id, role)
);

-- Tabela de professores
create table public.professores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null unique,
  telefone text,
  areas text[] default '{}',
  redes_sociais jsonb default '{}',
  bio text,
  foto text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabela de vendedoras
create table public.vendedoras (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique,
  nome text not null,
  email text not null unique,
  meta_mensal numeric(10,2) default 0,
  meta_anual numeric(10,2) default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabela de cursos
create table public.cursos (
  id uuid primary key default gen_random_uuid(),
  tema text not null,
  professor_id uuid references public.professores(id) on delete restrict,
  cidade text not null,
  estado text not null,
  data_inicio date not null,
  data_termino date not null,
  carga_horaria integer not null,
  valor_inscricao numeric(10,2) not null,
  descricao text,
  status curso_status default 'Planejado',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabela de leads
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  curso_id uuid references public.cursos(id) on delete cascade not null,
  vendedora_id uuid references public.vendedoras(id) on delete restrict not null,
  nome_responsavel text not null,
  orgao text not null,
  setor text,
  cidade text not null,
  estado text not null,
  telefone text,
  email text,
  quantidade_inscricoes integer default 1,
  valor_proposta numeric(10,2) not null,
  valor_negociado numeric(10,2),
  status lead_status default 'Proposta Enviada',
  data_cadastro date default current_date,
  data_conversao date,
  motivo_perda motivo_perda,
  observacoes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabela de metas globais
create table public.metas_globais (
  id uuid primary key default gen_random_uuid(),
  ano integer not null unique,
  valor numeric(12,2) not null,
  descricao text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabela de taxas de comissão
create table public.taxas_comissao (
  id uuid primary key default gen_random_uuid(),
  taxa numeric(5,2) not null check (taxa >= 0 and taxa <= 100),
  vendedora_id uuid references public.vendedoras(id) on delete cascade,
  curso_id uuid references public.cursos(id) on delete cascade,
  tipo taxa_tipo not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (vendedora_id, curso_id)
);

-- ============================================
-- PARTE 3: ENABLE RLS
-- ============================================

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.professores enable row level security;
alter table public.vendedoras enable row level security;
alter table public.cursos enable row level security;
alter table public.leads enable row level security;
alter table public.metas_globais enable row level security;
alter table public.taxas_comissao enable row level security;

-- ============================================
-- PARTE 4: FUNCTIONS (SECURITY DEFINER)
-- ============================================

-- Função SECURITY DEFINER para verificar role (evita recursão RLS)
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Função para obter role do usuário atual
create or replace function public.get_user_role()
returns app_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.user_roles
  where user_id = auth.uid()
  limit 1
$$;

-- Função para criar perfil quando novo usuário se registra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, nome)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

-- Função genérica para atualizar updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Calcular inscrições de um curso
create or replace function public.get_inscricoes_curso(_curso_id uuid)
returns bigint
language sql
stable
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

-- ============================================
-- PARTE 5: TRIGGERS
-- ============================================

-- Trigger para criar perfil automaticamente
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Triggers para updated_at
create trigger set_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();
  
create trigger set_updated_at before update on public.professores
  for each row execute function public.handle_updated_at();
  
create trigger set_updated_at before update on public.vendedoras
  for each row execute function public.handle_updated_at();
  
create trigger set_updated_at before update on public.cursos
  for each row execute function public.handle_updated_at();
  
create trigger set_updated_at before update on public.leads
  for each row execute function public.handle_updated_at();
  
create trigger set_updated_at before update on public.metas_globais
  for each row execute function public.handle_updated_at();
  
create trigger set_updated_at before update on public.taxas_comissao
  for each row execute function public.handle_updated_at();

-- ============================================
-- PARTE 6: RLS POLICIES
-- ============================================

-- Policies para profiles
create policy "Users can view their own profile"
on public.profiles for select
to authenticated
using (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id);

create policy "Admins can view all profiles"
on public.profiles for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Policies para user_roles
create policy "Users can view their own roles"
on public.user_roles for select
to authenticated
using (auth.uid() = user_id);

create policy "Admins can manage all roles"
on public.user_roles for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Policies para professores
create policy "Authenticated users can view professores"
on public.professores for select
to authenticated
using (true);

create policy "Admins can manage professores"
on public.professores for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Policies para vendedoras
create policy "Authenticated users can view vendedoras"
on public.vendedoras for select
to authenticated
using (true);

create policy "Vendedoras can update own data"
on public.vendedoras for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Admins can manage vendedoras"
on public.vendedoras for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Policies para cursos
create policy "Authenticated users can view cursos"
on public.cursos for select
to authenticated
using (true);

create policy "Admins can manage cursos"
on public.cursos for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Policies para leads
create policy "Authenticated users can view leads"
on public.leads for select
to authenticated
using (true);

create policy "Vendedoras can manage own leads"
on public.leads for all
to authenticated
using (
  exists (
    select 1 from public.vendedoras
    where vendedoras.id = leads.vendedora_id
    and vendedoras.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.vendedoras
    where vendedoras.id = leads.vendedora_id
    and vendedoras.user_id = auth.uid()
  )
);

create policy "Admins and managers can manage all leads"
on public.leads for all
to authenticated
using (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'gerente')
)
with check (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'gerente')
);

-- Policies para metas_globais
create policy "Authenticated users can view metas_globais"
on public.metas_globais for select
to authenticated
using (true);

create policy "Admins can manage metas_globais"
on public.metas_globais for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Policies para taxas_comissao
create policy "Authenticated users can view taxas_comissao"
on public.taxas_comissao for select
to authenticated
using (true);

create policy "Admins can manage taxas_comissao"
on public.taxas_comissao for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- PARTE 7: VIEWS
-- ============================================

-- View de performance de vendedoras
create or replace view public.view_performance_vendedoras as
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
create or replace view public.view_stats_cursos as
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

-- ============================================
-- PARTE 8: ÍNDICES PARA PERFORMANCE
-- ============================================

create index idx_leads_curso_id on public.leads(curso_id);
create index idx_leads_vendedora_id on public.leads(vendedora_id);
create index idx_leads_status on public.leads(status);
create index idx_leads_data_conversao on public.leads(data_conversao);
create index idx_cursos_data_inicio on public.cursos(data_inicio);
create index idx_cursos_status on public.cursos(status);
create index idx_vendedoras_user_id on public.vendedoras(user_id);
create index idx_user_roles_user_id on public.user_roles(user_id);

-- ============================================
-- PARTE 9: DADOS INICIAIS
-- ============================================

-- Taxa de comissão padrão
insert into public.taxas_comissao (taxa, tipo)
values (5.0, 'Padrão');

-- Metas globais
insert into public.metas_globais (ano, valor, descricao)
values
  (2024, 1800000, 'Meta coletiva 2024 - Alcançando juntas o sucesso!'),
  (2025, 2000000, 'Alcançando a meta coletiva, todas as vendedoras receberão bônus especial de fim de ano.'),
  (2026, 2200000, 'Meta de crescimento 2026 com foco em expansão regional.');

-- ============================================
-- PARTE 10: REALTIME (REPLICA IDENTITY)
-- ============================================

alter table public.cursos replica identity full;
alter table public.leads replica identity full;
alter table public.vendedoras replica identity full;
alter table public.professores replica identity full;
alter table public.metas_globais replica identity full;
alter table public.taxas_comissao replica identity full;