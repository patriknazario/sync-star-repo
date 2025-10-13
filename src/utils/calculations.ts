import { Lead as SupabaseLead } from '@/hooks/useLeads';

// Aceita IDs como string (Supabase) ou number (legacy)
type FlexibleId = string | number;

// Calcula inscrições realizadas de um curso dinamicamente a partir dos leads
export const getInscricoesCurso = (leads: SupabaseLead[], cursoId: FlexibleId): number => {
  return leads
    .filter(l => l.curso_id === cursoId && l.status === 'Inscrição Realizada')
    .reduce((sum, l) => sum + (l.quantidade_inscricoes || 0), 0);
};

// Calcula faturamento de um curso a partir dos leads com inscrições realizadas
export const getFaturamentoCurso = (leads: SupabaseLead[], cursoId: FlexibleId): number => {
  return leads
    .filter(l => l.curso_id === cursoId && l.status === 'Inscrição Realizada')
    .reduce((sum, l) => sum + (l.valor_negociado ?? l.valor_proposta), 0);
};

export const calculateComissao = (faturamento: number): number => {
  return faturamento * 0.05;
};

export const calculateFaturamentoByVendedora = (leads: SupabaseLead[], vendedoraId: FlexibleId): number => {
  return leads
    .filter(l => l.vendedora_id === vendedoraId && l.status === 'Inscrição Realizada')
    .reduce((sum, l) => sum + (l.valor_negociado ?? l.valor_proposta), 0);
};

export const calculateInscricoesByVendedora = (leads: SupabaseLead[], vendedoraId: FlexibleId): number => {
  return leads
    .filter(l => l.vendedora_id === vendedoraId && l.status === 'Inscrição Realizada')
    .reduce((sum, l) => sum + (l.quantidade_inscricoes || 0), 0);
};

export const calculateTotalFaturamento = (leads: SupabaseLead[]): number => {
  return leads
    .filter(l => l.status === 'Inscrição Realizada')
    .reduce((sum, l) => sum + (l.valor_negociado ?? l.valor_proposta), 0);
};

export const calculateTotalInscricoes = (leads: SupabaseLead[]): number => {
  return leads
    .filter(l => l.status === 'Inscrição Realizada')
    .reduce((sum, l) => sum + (l.quantidade_inscricoes || 0), 0);
};

export const calculateReceitaPotencial = (leads: SupabaseLead[]): number => {
  return leads
    .filter(l => l.status === 'Proposta Enviada')
    .reduce((sum, l) => sum + (l.valor_negociado ?? l.valor_proposta), 0);
};

export const calculateTaxaConversao = (leads: SupabaseLead[]): number => {
  const total = leads.filter(l => l.status !== 'Proposta Enviada').length;
  const convertidos = leads.filter(l => l.status === 'Inscrição Realizada').length;
  return total > 0 ? (convertidos / total) * 100 : 0;
};

export const calculateCicloVendas = (leads: SupabaseLead[]): number => {
  const convertidos = leads.filter(l => l.status === 'Inscrição Realizada' && l.data_conversao);
  
  if (convertidos.length === 0) return 0;
  
  const totalDias = convertidos.reduce((sum, l) => {
    const cadastro = new Date(l.data_cadastro);
    const conversao = new Date(l.data_conversao!);
    const diff = Math.floor((conversao.getTime() - cadastro.getTime()) / (1000 * 60 * 60 * 24));
    return sum + diff;
  }, 0);
  
  return totalDias / convertidos.length;
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-BR').format(value);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

// Validações
export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validateTelefone = (telefone: string): boolean => {
  const regex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
  return regex.test(telefone);
};

export const validateDates = (dataInicio: string, dataTermino: string): { valid: boolean; message?: string } => {
  if (!dataInicio || !dataTermino) {
    return { valid: false, message: 'Datas são obrigatórias' };
  }
  
  const inicio = new Date(dataInicio);
  const termino = new Date(dataTermino);
  
  if (termino < inicio) {
    return { valid: false, message: 'Data de término deve ser posterior à data de início' };
  }
  
  return { valid: true };
};

export const validatePositiveNumber = (value: number, fieldName: string): { valid: boolean; message?: string } => {
  if (value <= 0) {
    return { valid: false, message: `${fieldName} deve ser maior que zero` };
  }
  return { valid: true };
};

export const getDaysUntil = (dateString: string): number => {
  const target = new Date(dateString);
  const today = new Date();
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const shouldShowViabilityAlert = (inscricoes: number, dataInicio: string): boolean => {
  return inscricoes < 15 && getDaysUntil(dataInicio) <= 7;
};
