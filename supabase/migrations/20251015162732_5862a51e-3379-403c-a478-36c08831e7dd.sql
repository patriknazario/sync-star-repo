-- =====================================================
-- SEED DATA - Dados iniciais do sistema
-- =====================================================

-- 1. PROFESSORES
INSERT INTO public.professores (id, nome, email, telefone, especialidade) VALUES
(1, 'Dr. Roberto Andrade', 'roberto.andrade@cgp.edu.br', '(11) 98765-4321', 'Gestão Pública, Licitações, Contratos'),
(2, 'Dra. Mariana Souza', 'mariana.souza@cgp.edu.br', '(21) 97654-3210', 'Gestão de Pessoas, RH, Desenvolvimento Organizacional'),
(3, 'Prof. Carlos Mendes', 'carlos.mendes@cgp.edu.br', '(61) 99876-5432', 'Finanças Públicas, Orçamento, Controladoria'),
(4, 'Dra. Patricia Lima', 'patricia.lima@cgp.edu.br', '(85) 98765-1234', 'Planejamento Estratégico, Gestão de Projetos'),
(5, 'Prof. Fernando Costa', 'fernando.costa@cgp.edu.br', '(71) 97654-8765', 'Direito Administrativo, Legislação, Compliance')
ON CONFLICT (id) DO NOTHING;

-- 2. VENDEDORAS
INSERT INTO public.vendedoras (id, nome, email, telefone, meta_mensal, meta_anual, ano) VALUES
(1, 'Ariane', 'ariane@cgp.com.br', '(11) 91234-5678', 50000, 600000, 2025),
(2, 'Elis', 'elis@cgp.com.br', '(11) 91234-5679', 45000, 540000, 2025),
(3, 'Viviane', 'viviane@cgp.com.br', '(11) 91234-5680', 48000, 576000, 2025),
(4, 'Ana', 'ana@cgp.com.br', '(11) 91234-5681', 42000, 504000, 2025),
(5, 'Najara', 'najara@cgp.com.br', '(11) 91234-5682', 46000, 552000, 2025),
(6, 'Halana', 'halana@cgp.com.br', '(11) 91234-5683', 44000, 528000, 2025),
(7, 'Elaine', 'elaine@cgp.com.br', '(11) 91234-5684', 47000, 564000, 2025),
(8, 'Andreia', 'andreia@cgp.com.br', '(11) 91234-5685', 43000, 516000, 2025),
(9, 'Fulana', 'fulana@cgp.com.br', '(11) 91234-5686', 45000, 540000, 2025),
(10, 'Ciclana', 'ciclana@cgp.com.br', '(11) 91234-5687', 49000, 588000, 2025),
(11, 'Beltrana', 'beltrana@cgp.com.br', '(11) 91234-5688', 44000, 528000, 2025)
ON CONFLICT (id) DO NOTHING;

-- 3. CURSOS
INSERT INTO public.cursos (id, nome, professor_id, cidade, estado, data_inicio, data_termino, carga_horaria, valor_total, descricao, status, modalidade, meta_inscricoes) VALUES
(1, 'Licitações e Contratos Administrativos', 1, 'São Paulo', 'SP', '2025-11-15', '2025-11-17', 24, 1200, 'Curso completo sobre o processo licitatório e gestão de contratos públicos', 'Em Andamento', 'Presencial', 50),
(2, 'Gestão de Pessoas no Setor Público', 2, 'Brasília', 'DF', '2025-10-20', '2025-10-22', 20, 980, 'Estratégias modernas de gestão de pessoas aplicadas ao setor público', 'Em Andamento', 'Presencial', 45),
(3, 'Planejamento e Orçamento Público', 3, 'Rio de Janeiro', 'RJ', '2025-11-25', '2025-11-27', 24, 1150, 'Elaboração e gestão do orçamento público com foco em eficiência', 'Em Andamento', 'Presencial', 48),
(4, 'Compliance e Ética na Administração Pública', 5, 'Fortaleza', 'CE', '2025-12-05', '2025-12-07', 20, 1050, 'Programas de integridade e compliance aplicados ao setor público', 'Planejado', 'Presencial', 40),
(5, 'Gestão Estratégica de Projetos Públicos', 4, 'Salvador', 'BA', '2025-10-15', '2025-10-17', 24, 1180, 'Metodologias ágeis e tradicionais aplicadas a projetos governamentais', 'Em Andamento', 'Presencial', 42),
(6, 'Controladoria e Auditoria Pública', 3, 'Belo Horizonte', 'MG', '2025-09-10', '2025-09-12', 20, 1100, 'Técnicas de auditoria e controladoria para gestores públicos', 'Concluído', 'Presencial', 35)
ON CONFLICT (id) DO NOTHING;

-- 4. LEADS (apenas colunas que existem na tabela)
INSERT INTO public.leads (id, curso_id, nome_cliente, empresa, cargo, telefone_cliente, email_cliente, quantidade_inscricoes, valor_proposta, valor_negociado, vendedora_id, status, data_cadastro, data_conversao, observacoes) VALUES
(1, 1, 'João Pereira', 'Prefeitura Municipal de Campinas', 'Secretaria de Finanças', '(19) 3234-5678', 'joao.pereira@campinas.sp.gov.br', 3, 3600, 3200, 1, 'Proposta Enviada', '2025-09-15', NULL, 'Cliente de Campinas, SP'),
(2, 1, 'Maria Santos', 'Secretaria de Educação do Estado de SP', 'Recursos Humanos', '(11) 3456-7890', 'maria.santos@educacao.sp.gov.br', 5, 6000, NULL, 2, 'Inscrição Realizada', '2025-09-10', '2025-09-20', 'Cliente de São Paulo, SP'),
(3, 2, 'Carlos Oliveira', 'Tribunal de Contas da União', 'Auditoria', '(61) 3321-9876', 'carlos@tcu.gov.br', 2, 1960, NULL, 3, 'Não Convertido', '2025-09-05', NULL, 'Cliente de Brasília, DF'),
(4, 3, 'Ana Paula Costa', 'Governo do Estado do RJ', 'Planejamento', '(21) 2234-5678', 'ana.costa@rj.gov.br', 4, 4600, 4100, 1, 'Inscrição Realizada', '2025-09-12', '2025-09-25', 'Cliente do Rio de Janeiro, RJ'),
(5, 3, 'Roberto Silva', 'Câmara Municipal do RJ', 'Administração', '(21) 3345-6789', 'roberto@camara.rj.gov.br', 6, 6900, NULL, 2, 'Proposta Enviada', '2025-09-18', NULL, 'Cliente do Rio de Janeiro, RJ')
ON CONFLICT (id) DO NOTHING;

-- 5. METAS GLOBAIS
INSERT INTO public.metas_globais (ano, meta_faturamento, meta_inscricoes) VALUES
(2024, 1800000, 1500),
(2025, 2000000, 1700),
(2026, 2200000, 1850)
ON CONFLICT (ano) DO NOTHING;

-- 6. TAXAS DE COMISSÃO
INSERT INTO public.taxas_comissao (id, nome, percentual) VALUES
(1, 'Taxa Padrão', 5.0)
ON CONFLICT (id) DO NOTHING;

-- Resetar as sequences para IDs
SELECT setval('professores_id_seq', (SELECT MAX(id) FROM public.professores));
SELECT setval('vendedoras_id_seq', (SELECT MAX(id) FROM public.vendedoras));
SELECT setval('cursos_id_seq', (SELECT MAX(id) FROM public.cursos));
SELECT setval('leads_id_seq', (SELECT MAX(id) FROM public.leads));
SELECT setval('taxas_comissao_id_seq', (SELECT MAX(id) FROM public.taxas_comissao));