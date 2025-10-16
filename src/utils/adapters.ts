// Adapters para mapear entre tipos do Supabase e tipos do frontend
import { Tables } from '@/integrations/supabase/types';
import { Curso, Lead, Professor, Vendedora, MetaGlobal } from '@/data/mockData';

// Cursos
export function cursoDBToFrontend(curso: Tables<'cursos'>): Curso {
  return {
    id: curso.id,
    tema: curso.nome,
    professorId: curso.professor_id || 0,
    cidade: curso.cidade || '',
    estado: curso.estado || '',
    dataInicio: curso.data_inicio,
    dataTermino: curso.data_termino,
    cargaHoraria: curso.carga_horaria,
    valorInscricao: Number(curso.valor_total),
    descricao: curso.descricao || '',
    status: curso.status as Curso['status'],
  };
}

export function cursoFrontendToDB(curso: Partial<Curso>): Partial<Tables<'cursos'>> {
  return {
    nome: curso.tema,
    professor_id: curso.professorId,
    cidade: curso.cidade,
    estado: curso.estado,
    data_inicio: curso.dataInicio,
    data_termino: curso.dataTermino,
    carga_horaria: curso.cargaHoraria,
    valor_total: curso.valorInscricao,
    descricao: curso.descricao,
    status: mapCursoStatusToDB(curso.status) as any,
  };
}

// Leads
export function leadDBToFrontend(lead: Tables<'leads'>): Lead {
  return {
    id: lead.id,
    cursoId: lead.curso_id,
    nomeResponsavel: lead.nome_cliente,
    orgao: lead.empresa || '',
    setor: lead.cargo || '',
    cidade: '', // Não existe no DB, usar observacoes
    estado: '', // Não existe no DB, usar observacoes
    telefone: lead.telefone_cliente || '',
    email: lead.email_cliente,
    quantidadeInscricoes: lead.quantidade_inscricoes,
    valorProposta: Number(lead.valor_proposta),
    valorNegociado: lead.valor_negociado ? Number(lead.valor_negociado) : undefined,
    vendedoraId: lead.vendedora_id,
    status: mapLeadStatus(lead.status),
    dataCadastro: lead.data_cadastro || new Date().toISOString().split('T')[0],
    dataConversao: lead.data_conversao || undefined,
    observacoes: lead.observacoes || undefined,
  };
}

export function leadFrontendToDB(lead: Partial<Lead>): Partial<Tables<'leads'>> {
  return {
    curso_id: lead.cursoId,
    nome_cliente: lead.nomeResponsavel,
    empresa: lead.orgao,
    cargo: lead.setor,
    telefone_cliente: lead.telefone,
    email_cliente: lead.email,
    quantidade_inscricoes: lead.quantidadeInscricoes,
    valor_proposta: lead.valorProposta,
    valor_negociado: lead.valorNegociado,
    vendedora_id: lead.vendedoraId,
    status: mapLeadStatusToDB(lead.status) as any,
    data_cadastro: lead.dataCadastro,
    data_conversao: lead.dataConversao,
    observacoes: lead.observacoes,
  };
}

// Professores
export function professorDBToFrontend(professor: Tables<'professores'>): Professor {
  const areas = professor.especialidade?.split(',').map(a => a.trim()) || [];
  return {
    id: professor.id,
    nome: professor.nome,
    email: professor.email,
    telefone: professor.telefone || '',
    areas: areas,
    redesSociais: {},
    bio: '',
    foto: undefined,
  };
}

export function professorFrontendToDB(professor: Partial<Professor>): Partial<Tables<'professores'>> {
  return {
    nome: professor.nome,
    email: professor.email,
    telefone: professor.telefone,
    especialidade: professor.areas?.join(', '),
  };
}

// Vendedoras
export function vendedoraDBToFrontend(vendedora: Tables<'vendedoras'>): Vendedora {
  return {
    id: vendedora.id,
    nome: vendedora.nome,
    metaMensal: Number(vendedora.meta_mensal),
    metaAnual: Number(vendedora.meta_anual),
  };
}

// Metas Globais
export function metaGlobalDBToFrontend(meta: Tables<'metas_globais'>): MetaGlobal {
  return {
    ano: meta.ano,
    valor: Number(meta.meta_faturamento),
    descricao: '',
  };
}

// Status mapping - Mapeamento direto após adicionar "Inscrições Abertas" ao enum
function mapCursoStatus(status: string): Curso['status'] {
  return status as Curso['status'];
}

function mapCursoStatusToDB(status: Curso['status'] | undefined): string {
  if (!status) return 'Planejado';
  return status;
}

function mapLeadStatus(status: string): Lead['status'] {
  const statusMap: Record<string, Lead['status']> = {
    'Proposta Enviada': 'Proposta Enviada',
    'Inscrição Realizada': 'Inscrição Realizada',
    'Não Convertido': 'Proposta Declinada',
  };
  return statusMap[status] || 'Proposta Enviada';
}

function mapLeadStatusToDB(status: Lead['status'] | undefined): string {
  if (!status) return 'Proposta Enviada';
  const statusMap: Record<Lead['status'], string> = {
    'Proposta Enviada': 'Proposta Enviada',
    'Inscrição Realizada': 'Inscrição Realizada',
    'Proposta Declinada': 'Não Convertido',
  };
  return statusMap[status];
}
