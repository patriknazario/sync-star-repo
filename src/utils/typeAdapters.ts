import { Curso as SupabaseCurso } from '@/hooks/useCursos';
import { Lead as SupabaseLead } from '@/hooks/useLeads';
import { Vendedora as SupabaseVendedora } from '@/hooks/useVendedoras';
import { Professor as SupabaseProfessor } from '@/hooks/useProfessores';

// Adapta tipos Supabase para cálculos (mantem compatibilidade)
export const adaptCursoForCalcs = (curso: SupabaseCurso) => ({
  ...curso,
  id: curso.id as any, // Força compatibilidade
  professorId: curso.professor_id as any,
  dataInicio: curso.data_inicio,
  dataTermino: curso.data_termino,
  cargaHoraria: curso.carga_horaria,
  valorInscricao: curso.valor_inscricao,
});

export const adaptLeadForCalcs = (lead: SupabaseLead) => ({
  ...lead,
  id: lead.id as any,
  cursoId: lead.curso_id as any,
  nomeResponsavel: lead.nome_responsavel,
  quantidadeInscricoes: lead.quantidade_inscricoes,
  valorProposta: lead.valor_proposta,
  valorNegociado: lead.valor_negociado,
  vendedoraId: lead.vendedora_id as any,
  dataCadastro: lead.data_cadastro,
  dataConversao: lead.data_conversao,
  motivoPerda: lead.motivo_perda,
});
