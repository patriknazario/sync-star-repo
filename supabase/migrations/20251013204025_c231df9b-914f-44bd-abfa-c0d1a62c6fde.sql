-- ============================================
-- FASE 1: POPULAR BANCO DE DADOS DO SUPABASE
-- Migração de dados do mockData.ts para Supabase
-- ============================================

-- Limpar dados existentes (se houver) para evitar conflitos
DELETE FROM public.leads;
DELETE FROM public.cursos;
DELETE FROM public.professores;
DELETE FROM public.vendedoras;
DELETE FROM public.taxas_comissao;
DELETE FROM public.metas_globais;

-- 1. INSERIR PROFESSORES
INSERT INTO public.professores (nome, email, telefone, areas, redes_sociais, bio) VALUES
('Dr. Roberto Andrade', 'roberto.andrade@cgp.edu.br', '(11) 98765-4321', 
 ARRAY['Gestão Pública', 'Licitações', 'Contratos'],
 '{"linkedin": "linkedin.com/in/robertoandrade", "instagram": "@prof.roberto"}'::jsonb,
 'Especialista em licitações públicas com 15 anos de experiência em gestão governamental'),
 
('Dra. Mariana Souza', 'mariana.souza@cgp.edu.br', '(21) 97654-3210',
 ARRAY['Gestão de Pessoas', 'RH', 'Desenvolvimento Organizacional'],
 '{"linkedin": "linkedin.com/in/marianasouza", "site": "marianasouza.com.br"}'::jsonb,
 'Doutora em Administração Pública, especialista em gestão de pessoas no setor público'),
 
('Prof. Carlos Mendes', 'carlos.mendes@cgp.edu.br', '(61) 99876-5432',
 ARRAY['Finanças Públicas', 'Orçamento', 'Controladoria'],
 '{"linkedin": "linkedin.com/in/carlosmendes"}'::jsonb,
 'Contador público com especialização em finanças governamentais e controle orçamentário'),
 
('Dra. Patricia Lima', 'patricia.lima@cgp.edu.br', '(85) 98765-1234',
 ARRAY['Planejamento Estratégico', 'Gestão de Projetos'],
 '{"linkedin": "linkedin.com/in/patricialima", "instagram": "@dra.patricia"}'::jsonb,
 'Especialista em planejamento estratégico e gestão de projetos públicos'),
 
('Prof. Fernando Costa', 'fernando.costa@cgp.edu.br', '(71) 97654-8765',
 ARRAY['Direito Administrativo', 'Legislação', 'Compliance'],
 '{"linkedin": "linkedin.com/in/fernandocosta"}'::jsonb,
 'Advogado especialista em direito administrativo e compliance no setor público');

-- 2. INSERIR CURSOS (usando subquery para pegar professor_id por email)
INSERT INTO public.cursos (tema, professor_id, cidade, estado, data_inicio, data_termino, carga_horaria, valor_inscricao, descricao, status) VALUES
('Licitações e Contratos Administrativos', 
 (SELECT id FROM public.professores WHERE email = 'roberto.andrade@cgp.edu.br'),
 'São Paulo', 'SP', '2025-11-15', '2025-11-17', 24, 1200,
 'Curso completo sobre o processo licitatório e gestão de contratos públicos',
 'Inscrições Abertas'::curso_status),

('Gestão de Pessoas no Setor Público',
 (SELECT id FROM public.professores WHERE email = 'mariana.souza@cgp.edu.br'),
 'Brasília', 'DF', '2025-10-20', '2025-10-22', 20, 980,
 'Estratégias modernas de gestão de pessoas aplicadas ao setor público',
 'Inscrições Abertas'::curso_status),

('Planejamento e Orçamento Público',
 (SELECT id FROM public.professores WHERE email = 'carlos.mendes@cgp.edu.br'),
 'Rio de Janeiro', 'RJ', '2025-11-25', '2025-11-27', 24, 1150,
 'Elaboração e gestão do orçamento público com foco em eficiência',
 'Inscrições Abertas'::curso_status),

('Compliance e Ética na Administração Pública',
 (SELECT id FROM public.professores WHERE email = 'fernando.costa@cgp.edu.br'),
 'Fortaleza', 'CE', '2025-12-05', '2025-12-07', 20, 1050,
 'Programas de integridade e compliance aplicados ao setor público',
 'Planejado'::curso_status),

('Gestão Estratégica de Projetos Públicos',
 (SELECT id FROM public.professores WHERE email = 'patricia.lima@cgp.edu.br'),
 'Salvador', 'BA', '2025-10-15', '2025-10-17', 24, 1180,
 'Metodologias ágeis e tradicionais aplicadas a projetos governamentais',
 'Em Andamento'::curso_status),

('Controladoria e Auditoria Pública',
 (SELECT id FROM public.professores WHERE email = 'carlos.mendes@cgp.edu.br'),
 'Belo Horizonte', 'MG', '2025-09-10', '2025-09-12', 20, 1100,
 'Técnicas de auditoria e controladoria para gestores públicos',
 'Concluído'::curso_status);

-- 3. INSERIR VENDEDORAS (SEM user_id por enquanto, será vinculado depois)
INSERT INTO public.vendedoras (nome, email, meta_mensal, meta_anual) VALUES
('Ariane', 'arianealves@ccgp.com.br', 50000, 600000),
('Elis', 'elis@ccgp.com.br', 45000, 540000),
('Viviane', 'vivianesampaiocosta@ccgp.com.br', 48000, 576000),
('Ana', 'anavaleria@ccgp.com.br', 42000, 504000),
('Najara', 'najaracardoso@ccgp.com.br', 46000, 552000),
('Halana', 'halanadasilva@ccgp.com.br', 44000, 528000),
('Elaine', 'elaineprado@ccgp.com.br', 47000, 564000),
('Andreia', 'andreiabarros@ccgp.com.br', 43000, 516000),
('Patrik', 'patriknazario@ccgp.com.br', 45000, 540000),
('Juliana', 'julianabarbosa@ccgp.com.br', 49000, 588000),
('Sabrina', 'sabrinaalmeida@ccgp.com.br', 44000, 528000);

-- 4. VINCULAR VENDEDORAS COM AUTH.USERS (onde o email já existe)
UPDATE public.vendedoras v
SET user_id = u.id
FROM auth.users u
WHERE v.email = u.email;

-- 5. POPULAR USER_ROLES para todos os usuários @ccgp.com.br
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'vendedora'::app_role
FROM auth.users
WHERE email LIKE '%@ccgp.com.br'
ON CONFLICT (user_id, role) DO NOTHING;

-- 6. INSERIR LEADS (usando subqueries para pegar IDs corretos)
INSERT INTO public.leads (
  curso_id, nome_responsavel, orgao, setor, cidade, estado, 
  telefone, email, quantidade_inscricoes, valor_proposta, valor_negociado,
  vendedora_id, status, data_cadastro, data_conversao, motivo_perda
) VALUES
-- Lead 1: Proposta Enviada
((SELECT id FROM public.cursos WHERE tema = 'Licitações e Contratos Administrativos'),
 'João Pereira', 'Prefeitura Municipal de Campinas', 'Secretaria de Finanças',
 'Campinas', 'SP', '(19) 3234-5678', 'joao.pereira@campinas.sp.gov.br',
 3, 3600, 3200,
 (SELECT id FROM public.vendedoras WHERE nome = 'Ariane'),
 'Proposta Enviada'::lead_status, '2025-09-15', NULL, NULL),

-- Lead 2: Inscrição Realizada
((SELECT id FROM public.cursos WHERE tema = 'Licitações e Contratos Administrativos'),
 'Maria Santos', 'Secretaria de Educação do Estado de SP', 'Recursos Humanos',
 'São Paulo', 'SP', '(11) 3456-7890', 'maria.santos@educacao.sp.gov.br',
 5, 6000, NULL,
 (SELECT id FROM public.vendedoras WHERE nome = 'Elis'),
 'Inscrição Realizada'::lead_status, '2025-09-10', '2025-09-20', NULL),

-- Lead 3: Proposta Declinada
((SELECT id FROM public.cursos WHERE tema = 'Gestão de Pessoas no Setor Público'),
 'Carlos Oliveira', 'Tribunal de Contas da União', 'Auditoria',
 'Brasília', 'DF', '(61) 3321-9876', 'carlos@tcu.gov.br',
 2, 1960, NULL,
 (SELECT id FROM public.vendedoras WHERE nome = 'Viviane'),
 'Proposta Declinada'::lead_status, '2025-09-05', NULL, 'Preço'::motivo_perda),

-- Lead 4: Inscrição Realizada
((SELECT id FROM public.cursos WHERE tema = 'Planejamento e Orçamento Público'),
 'Ana Paula Costa', 'Governo do Estado do RJ', 'Planejamento',
 'Rio de Janeiro', 'RJ', '(21) 2234-5678', 'ana.costa@rj.gov.br',
 4, 4600, 4100,
 (SELECT id FROM public.vendedoras WHERE nome = 'Ariane'),
 'Inscrição Realizada'::lead_status, '2025-09-12', '2025-09-25', NULL),

-- Lead 5: Proposta Enviada
((SELECT id FROM public.cursos WHERE tema = 'Planejamento e Orçamento Público'),
 'Roberto Silva', 'Câmara Municipal do RJ', 'Administração',
 'Rio de Janeiro', 'RJ', '(21) 3345-6789', 'roberto@camara.rj.gov.br',
 6, 6900, NULL,
 (SELECT id FROM public.vendedoras WHERE nome = 'Elis'),
 'Proposta Enviada'::lead_status, '2025-09-18', NULL, NULL);

-- 7. INSERIR METAS GLOBAIS
INSERT INTO public.metas_globais (ano, valor, descricao) VALUES
(2024, 1800000, 'Meta coletiva 2024 - Alcançando juntas o sucesso!'),
(2025, 2000000, 'Alcançando a meta coletiva, todas as vendedoras receberão bônus especial de fim de ano.'),
(2026, 2200000, 'Meta de crescimento 2026 com foco em expansão regional.');

-- 8. INSERIR TAXAS DE COMISSÃO
INSERT INTO public.taxas_comissao (taxa, tipo) VALUES
(5.0, 'Padrão'::taxa_tipo);