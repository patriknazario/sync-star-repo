-- Adicionar novo valor ao enum curso_status para suportar o status "Inscrições Abertas"
-- usado no frontend mas ausente no banco de dados
ALTER TYPE curso_status ADD VALUE IF NOT EXISTS 'Inscrições Abertas' AFTER 'Planejado';