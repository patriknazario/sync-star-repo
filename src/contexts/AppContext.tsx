import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { Curso, Lead, Professor, Vendedora, Cliente, MetaGlobal, TaxaComissao } from '@/data/mockData';
import { useCursos } from '@/hooks/useCursos';
import { useLeads } from '@/hooks/useLeads';
import { useProfessores } from '@/hooks/useProfessores';
import { useVendedoras } from '@/hooks/useVendedoras';
import { useMetasGlobais } from '@/hooks/useMetasGlobais';
import { 
  cursoDBToFrontend, 
  cursoFrontendToDB,
  leadDBToFrontend,
  leadFrontendToDB,
  professorDBToFrontend,
  professorFrontendToDB,
  vendedoraDBToFrontend,
  metaGlobalDBToFrontend,
} from '@/utils/adapters';

interface AppContextType {
  cursos: Curso[];
  leads: Lead[];
  professores: Professor[];
  vendedoras: Vendedora[];
  clientes: Cliente[];
  metaTotalAnual: number;
  metasGlobais: MetaGlobal[];
  taxasComissao: TaxaComissao[];
  anoSelecionado: number;
  getInscricoesCurso: (cursoId: number) => number;
  
  // Cursos
  addCurso: (curso: Omit<Curso, 'id'>) => Promise<void>;
  updateCurso: (id: number, curso: Partial<Curso>) => Promise<void>;
  deleteCurso: (id: number) => Promise<void>;
  
  // Leads
  addLead: (lead: Omit<Lead, 'id'>) => Promise<void>;
  updateLead: (id: number, lead: Partial<Lead>) => Promise<void>;
  deleteLead: (id: number) => Promise<void>;
  moveLeadStatus: (id: number, newStatus: Lead['status'], motivoPerda?: Lead['motivoPerda'], observacoes?: string) => Promise<void>;
  
  // Professores
  addProfessor: (professor: Omit<Professor, 'id'>) => Promise<void>;
  updateProfessor: (id: number, professor: Partial<Professor>) => Promise<void>;
  deleteProfessor: (id: number) => Promise<void>;
  
  // Vendedoras
  updateVendedoraMeta: (id: number, metaMensal: number, metaAnual: number) => Promise<void>;
  
  // Meta Total
  setMetaTotalAnual: (meta: number) => void;
  
  // Metas Globais
  getMetaGlobalByAno: (ano: number) => MetaGlobal | undefined;
  updateMetaGlobal: (ano: number, meta: Partial<MetaGlobal>) => Promise<void>;
  calcRealizadoAno: (ano: number) => number;
  
  // Comissões
  addTaxaComissao: (taxa: Omit<TaxaComissao, 'id'>) => void;
  updateTaxaComissao: (id: number, taxa: Partial<TaxaComissao>) => void;
  deleteTaxaComissao: (id: number) => void;
  getTaxaComissao: (vendedoraId: number, cursoId: number) => number;
  
  // Ano
  setAnoSelecionado: (ano: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [anoSelecionado, setAnoSelecionado] = React.useState<number>(2025);
  
  // Hooks do Supabase
  const cursosHook = useCursos();
  const leadsHook = useLeads();
  const professoresHook = useProfessores();
  const vendedorasHook = useVendedoras(anoSelecionado);
  const metasGlobaisHook = useMetasGlobais();
  
  // Converter dados do Supabase para formato do frontend
  const cursos = useMemo(() => 
    cursosHook.cursos.map(cursoDBToFrontend), 
    [cursosHook.cursos]
  );
  
  const leads = useMemo(() => 
    leadsHook.leads.map(leadDBToFrontend), 
    [leadsHook.leads]
  );
  
  const professores = useMemo(() => 
    professoresHook.professores.map(professorDBToFrontend), 
    [professoresHook.professores]
  );
  
  const vendedoras = useMemo(() => 
    vendedorasHook.vendedoras.map(vendedoraDBToFrontend), 
    [vendedorasHook.vendedoras]
  );
  
  const metasGlobais = useMemo(() => 
    metasGlobaisHook.metasGlobais.map(metaGlobalDBToFrontend), 
    [metasGlobaisHook.metasGlobais]
  );

  // Taxas de comissão (mantido em memória por enquanto - pode ser migrado depois)
  const [taxasComissao] = React.useState<TaxaComissao[]>([
    { id: 1, taxa: 5.0, tipo: 'Padrão' }
  ]);

  // Clientes derivados dos leads
  const clientes = useMemo(() => extractClientesFromLeads(leads), [leads]);
  
  // Meta total calculada
  const metaTotalAnual = useMemo(() => 
    vendedoras.reduce((sum, v) => sum + v.metaAnual, 0), 
    [vendedoras]
  );

  // Função para extrair clientes dos leads
  function extractClientesFromLeads(leadsData: Lead[]): Cliente[] {
    const clientesMap = new Map<string, Cliente>();
    
    leadsData
      .filter(l => l.status === 'Inscrição Realizada')
      .forEach(lead => {
        const key = lead.orgao.toLowerCase();
        
        if (clientesMap.has(key)) {
          const cliente = clientesMap.get(key)!;
          const valorFinal = lead.valorNegociado ?? lead.valorProposta;
          cliente.historicoCursos.push({
            cursoId: lead.cursoId,
            data: lead.dataConversao!,
            valor: valorFinal,
          });
          cliente.totalGasto += valorFinal;
          if (lead.dataConversao! > cliente.ultimaCompra) {
            cliente.ultimaCompra = lead.dataConversao!;
          }
        } else {
          const valorFinal = lead.valorNegociado ?? lead.valorProposta;
          clientesMap.set(key, {
            id: Date.now() + Math.random(),
            orgao: lead.orgao,
            cidade: lead.cidade,
            estado: lead.estado,
            contatos: [{
              nome: lead.nomeResponsavel,
              cargo: lead.setor || '',
              telefone: lead.telefone || '',
              email: lead.email || '',
            }],
            historicoCursos: [{
              cursoId: lead.cursoId,
              data: lead.dataConversao!,
              valor: valorFinal,
            }],
            totalGasto: valorFinal,
            ultimaCompra: lead.dataConversao!,
            recorrente: false,
          });
        }
      });
    
    const clientes = Array.from(clientesMap.values());
    clientes.forEach(cliente => {
      cliente.recorrente = cliente.historicoCursos.length >= 2;
    });
    
    return clientes;
  }

  // Função para obter inscrições de um curso
  const getInscricoesCurso = (cursoId: number): number => {
    return leads
      .filter(l => l.cursoId === cursoId && l.status === 'Inscrição Realizada')
      .reduce((sum, l) => sum + l.quantidadeInscricoes, 0);
  };

  // Cursos
  const addCurso = async (curso: Omit<Curso, 'id'>) => {
    await cursosHook.addCurso(cursoFrontendToDB(curso) as any);
  };

  const updateCurso = async (id: number, updates: Partial<Curso>) => {
    await cursosHook.updateCurso(id, cursoFrontendToDB(updates) as any);
  };

  const deleteCurso = async (id: number) => {
    await cursosHook.deleteCurso(id);
  };

  // Leads
  const addLead = async (lead: Omit<Lead, 'id'>) => {
    await leadsHook.addLead(leadFrontendToDB(lead) as any);
  };

  const updateLead = async (id: number, updates: Partial<Lead>) => {
    await leadsHook.updateLead(id, leadFrontendToDB(updates) as any);
  };

  const deleteLead = async (id: number) => {
    await leadsHook.deleteLead(id);
  };

  const moveLeadStatus = async (
    id: number, 
    newStatus: Lead['status'], 
    motivoPerda?: Lead['motivoPerda'], 
    observacoes?: string
  ) => {
    const updates: Partial<Lead> = { status: newStatus };
    
    if (newStatus === 'Inscrição Realizada') {
      updates.dataConversao = new Date().toISOString().split('T')[0];
      updates.motivoPerda = undefined;
    } else if (newStatus === 'Proposta Declinada') {
      updates.motivoPerda = motivoPerda;
      updates.observacoes = observacoes;
    }
    
    await updateLead(id, updates);
  };

  // Professores
  const addProfessor = async (professor: Omit<Professor, 'id'>) => {
    await professoresHook.addProfessor(professorFrontendToDB(professor) as any);
  };

  const updateProfessor = async (id: number, updates: Partial<Professor>) => {
    await professoresHook.updateProfessor(id, professorFrontendToDB(updates) as any);
  };

  const deleteProfessor = async (id: number) => {
    await professoresHook.deleteProfessor(id);
  };

  // Vendedoras
  const updateVendedoraMeta = async (id: number, metaMensal: number, metaAnual: number) => {
    await vendedorasHook.updateVendedoraMeta(id, metaMensal, metaAnual);
  };

  const setMetaTotalAnual = (meta: number) => {
    // Distribuir proporcionalmente (implementação futura se necessário)
    console.warn('setMetaTotalAnual não implementado com Supabase ainda');
  };

  // Metas Globais
  const getMetaGlobalByAno = (ano: number): MetaGlobal | undefined => {
    return metasGlobais.find(m => m.ano === ano);
  };

  const updateMetaGlobal = async (ano: number, updates: Partial<MetaGlobal>) => {
    await metasGlobaisHook.updateMetaGlobal(ano, {
      meta_faturamento: updates.valor,
    });
  };

  const calcRealizadoAno = (ano: number): number => {
    return leads
      .filter(l => 
        l.status === 'Inscrição Realizada' && 
        l.dataConversao?.startsWith(ano.toString())
      )
      .reduce((sum, l) => sum + (l.valorNegociado ?? l.valorProposta), 0);
  };

  // Comissões (mantido em memória)
  const addTaxaComissao = (taxa: Omit<TaxaComissao, 'id'>) => {
    console.warn('addTaxaComissao não implementado com Supabase ainda');
  };

  const updateTaxaComissao = (id: number, updates: Partial<TaxaComissao>) => {
    console.warn('updateTaxaComissao não implementado com Supabase ainda');
  };

  const deleteTaxaComissao = (id: number) => {
    console.warn('deleteTaxaComissao não implementado com Supabase ainda');
  };

  const getTaxaComissao = (vendedoraId: number, cursoId: number): number => {
    return 5.0; // Taxa padrão por enquanto
  };

  const value = {
    cursos,
    leads,
    professores,
    vendedoras,
    clientes,
    metaTotalAnual,
    metasGlobais,
    taxasComissao,
    anoSelecionado,
    getInscricoesCurso,
    addCurso,
    updateCurso,
    deleteCurso,
    addLead,
    updateLead,
    deleteLead,
    moveLeadStatus,
    addProfessor,
    updateProfessor,
    deleteProfessor,
    updateVendedoraMeta,
    setMetaTotalAnual,
    getMetaGlobalByAno,
    updateMetaGlobal,
    calcRealizadoAno,
    addTaxaComissao,
    updateTaxaComissao,
    deleteTaxaComissao,
    getTaxaComissao,
    setAnoSelecionado,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
