-- =====================================================
-- GESTOR COMERCIAL CGP - CONFIGURAÇÃO COMPLETA
-- =====================================================

-- 1. CRIAR ENUMS
CREATE TYPE public.app_role AS ENUM ('admin', 'gerente', 'vendedora', 'visualizador');
CREATE TYPE public.curso_status AS ENUM ('Planejado', 'Em Andamento', 'Concluído', 'Cancelado');
CREATE TYPE public.lead_status AS ENUM ('Proposta Enviada', 'Inscrição Realizada', 'Não Convertido');
CREATE TYPE public.modalidade AS ENUM ('Presencial', 'EAD', 'Híbrido');

-- 2. TABELA: professores
CREATE TABLE public.professores (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefone TEXT,
  especialidade TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.professores ENABLE ROW LEVEL SECURITY;

-- 3. TABELA: cursos
CREATE TABLE public.cursos (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  professor_id BIGINT REFERENCES public.professores(id) ON DELETE SET NULL,
  carga_horaria INTEGER NOT NULL DEFAULT 0,
  valor_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  meta_inscricoes INTEGER NOT NULL DEFAULT 0,
  data_inicio DATE NOT NULL,
  data_termino DATE NOT NULL,
  status public.curso_status NOT NULL DEFAULT 'Planejado',
  modalidade public.modalidade NOT NULL DEFAULT 'Presencial',
  descricao TEXT,
  estado TEXT,
  cidade TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;

-- 4. TABELA: vendedoras
CREATE TABLE public.vendedoras (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefone TEXT,
  meta_anual NUMERIC(10,2) NOT NULL DEFAULT 0,
  ano INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, ano)
);

ALTER TABLE public.vendedoras ENABLE ROW LEVEL SECURITY;

-- 5. TABELA: leads (CRM)
CREATE TABLE public.leads (
  id BIGSERIAL PRIMARY KEY,
  vendedora_id BIGINT NOT NULL REFERENCES public.vendedoras(id) ON DELETE CASCADE,
  curso_id BIGINT NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
  nome_cliente TEXT NOT NULL,
  email_cliente TEXT NOT NULL,
  telefone_cliente TEXT,
  empresa TEXT,
  cargo TEXT,
  quantidade_inscricoes INTEGER NOT NULL DEFAULT 1,
  valor_proposta NUMERIC(10,2) NOT NULL DEFAULT 0,
  valor_negociado NUMERIC(10,2),
  status public.lead_status NOT NULL DEFAULT 'Proposta Enviada',
  observacoes TEXT,
  data_cadastro TIMESTAMPTZ DEFAULT now(),
  data_conversao TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 6. TABELA: metas_globais
CREATE TABLE public.metas_globais (
  id BIGSERIAL PRIMARY KEY,
  ano INTEGER UNIQUE NOT NULL,
  meta_faturamento NUMERIC(10,2) NOT NULL DEFAULT 0,
  meta_inscricoes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.metas_globais ENABLE ROW LEVEL SECURITY;

-- 7. TABELA: taxas_comissao
CREATE TABLE public.taxas_comissao (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT UNIQUE NOT NULL,
  percentual NUMERIC(5,2) NOT NULL DEFAULT 5.00,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.taxas_comissao ENABLE ROW LEVEL SECURITY;

-- 8. TABELA: user_roles (SEGURANÇA)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 9. TABELA: profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FUNÇÕES AUXILIARES (SECURITY DEFINER)
-- =====================================================

-- Função: Verificar role do usuário
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = $1 LIMIT 1;
$$;

-- Função: Verificar se usuário tem role específica
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

-- Função: Verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin'
  );
$$;

-- Função: Calcular faturamento de um curso
CREATE OR REPLACE FUNCTION public.get_faturamento_curso(curso_id_param BIGINT)
RETURNS NUMERIC
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(SUM(COALESCE(valor_negociado, valor_proposta)), 0)
  FROM public.leads
  WHERE curso_id = curso_id_param AND status = 'Inscrição Realizada';
$$;

-- Função: Calcular inscrições de um curso
CREATE OR REPLACE FUNCTION public.get_inscricoes_curso(curso_id_param BIGINT)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(SUM(quantidade_inscricoes), 0)::INTEGER
  FROM public.leads
  WHERE curso_id = curso_id_param AND status = 'Inscrição Realizada';
$$;

-- Função: Calcular realizado no ano
CREATE OR REPLACE FUNCTION public.calc_realizado_ano(ano_param INTEGER)
RETURNS NUMERIC
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(SUM(COALESCE(l.valor_negociado, l.valor_proposta)), 0)
  FROM public.leads l
  JOIN public.cursos c ON l.curso_id = c.id
  WHERE EXTRACT(YEAR FROM c.data_inicio) = ano_param 
    AND l.status = 'Inscrição Realizada';
$$;

-- =====================================================
-- VIEWS DE PERFORMANCE
-- =====================================================

CREATE OR REPLACE VIEW public.view_performance_vendedoras AS
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

CREATE OR REPLACE VIEW public.view_stats_cursos AS
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

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_professores_updated_at BEFORE UPDATE ON public.professores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cursos_updated_at BEFORE UPDATE ON public.cursos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendedoras_updated_at BEFORE UPDATE ON public.vendedoras
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_metas_globais_updated_at BEFORE UPDATE ON public.metas_globais
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_taxas_comissao_updated_at BEFORE UPDATE ON public.taxas_comissao
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: Criar profile automaticamente ao criar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- PROFESSORES: Todos podem ver, apenas admin pode editar/deletar
CREATE POLICY "Todos podem visualizar professores" ON public.professores
  FOR SELECT USING (true);

CREATE POLICY "Admins podem inserir professores" ON public.professores
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins podem atualizar professores" ON public.professores
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins podem deletar professores" ON public.professores
  FOR DELETE USING (public.is_admin(auth.uid()));

-- CURSOS: Todos podem ver, apenas admin pode editar/deletar
CREATE POLICY "Todos podem visualizar cursos" ON public.cursos
  FOR SELECT USING (true);

CREATE POLICY "Admins podem inserir cursos" ON public.cursos
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins podem atualizar cursos" ON public.cursos
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins podem deletar cursos" ON public.cursos
  FOR DELETE USING (public.is_admin(auth.uid()));

-- VENDEDORAS: Todos podem ver
CREATE POLICY "Todos podem visualizar vendedoras" ON public.vendedoras
  FOR SELECT USING (true);

CREATE POLICY "Admins podem inserir vendedoras" ON public.vendedoras
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins podem atualizar vendedoras" ON public.vendedoras
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins podem deletar vendedoras" ON public.vendedoras
  FOR DELETE USING (public.is_admin(auth.uid()));

-- LEADS: Todos autenticados podem ver todos os leads
CREATE POLICY "Todos podem visualizar leads" ON public.leads
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Todos podem inserir leads" ON public.leads
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Todos podem atualizar leads" ON public.leads
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Todos podem deletar leads" ON public.leads
  FOR DELETE TO authenticated USING (true);

-- METAS GLOBAIS: Todos podem ver, apenas admin pode editar
CREATE POLICY "Todos podem visualizar metas globais" ON public.metas_globais
  FOR SELECT USING (true);

CREATE POLICY "Admins podem inserir metas globais" ON public.metas_globais
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins podem atualizar metas globais" ON public.metas_globais
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins podem deletar metas globais" ON public.metas_globais
  FOR DELETE USING (public.is_admin(auth.uid()));

-- TAXAS COMISSÃO: Todos podem ver, apenas admin pode editar
CREATE POLICY "Todos podem visualizar taxas comissao" ON public.taxas_comissao
  FOR SELECT USING (true);

CREATE POLICY "Admins podem inserir taxas comissao" ON public.taxas_comissao
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins podem atualizar taxas comissao" ON public.taxas_comissao
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins podem deletar taxas comissao" ON public.taxas_comissao
  FOR DELETE USING (public.is_admin(auth.uid()));

-- USER ROLES: Apenas admins podem gerenciar roles
CREATE POLICY "Admins podem visualizar roles" ON public.user_roles
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins podem inserir roles" ON public.user_roles
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins podem atualizar roles" ON public.user_roles
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins podem deletar roles" ON public.user_roles
  FOR DELETE USING (public.is_admin(auth.uid()));

-- PROFILES: Usuários podem ver seu próprio perfil
CREATE POLICY "Usuários podem visualizar próprio perfil" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar próprio perfil" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- =====================================================
-- DADOS INICIAIS (SEED)
-- =====================================================

-- Inserir ano atual em metas_globais
INSERT INTO public.metas_globais (ano, meta_faturamento, meta_inscricoes)
VALUES (2025, 5000000, 500)
ON CONFLICT (ano) DO NOTHING;

-- Inserir taxas de comissão padrão
INSERT INTO public.taxas_comissao (nome, percentual)
VALUES ('Comissão Padrão', 5.00)
ON CONFLICT (nome) DO NOTHING;