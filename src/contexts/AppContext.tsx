import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Curso, Lead, Professor, Vendedora, Cliente, MetaGlobal, TaxaComissao, cursos as initialCursos, leads as initialLeads, professores as initialProfessores, vendedoras as initialVendedoras, metasGlobais as initialMetasGlobais, taxasComissao as initialTaxasComissao } from '@/data/mockData';
import { getInscricoesCurso } from '@/utils/calculations';

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
  addCurso: (curso: Omit<Curso, 'id'>) => void;
  updateCurso: (id: number, curso: Partial<Curso>) => void;
  deleteCurso: (id: number) => void;
  
  // Leads
  addLead: (lead: Omit<Lead, 'id'>) => void;
  updateLead: (id: number, lead: Partial<Lead>) => void;
  deleteLead: (id: number) => void;
  moveLeadStatus: (id: number, newStatus: Lead['status'], motivoPerda?: Lead['motivoPerda'], observacoes?: string) => void;
  
  // Professores
  addProfessor: (professor: Omit<Professor, 'id'>) => void;
  updateProfessor: (id: number, professor: Partial<Professor>) => void;
  deleteProfessor: (id: number) => void;
  
  // Vendedoras
  updateVendedoraMeta: (id: number, metaMensal: number, metaAnual: number) => void;
  
  // Meta Total
  setMetaTotalAnual: (meta: number) => void;
  
  // Metas Globais
  getMetaGlobalByAno: (ano: number) => MetaGlobal | undefined;
  updateMetaGlobal: (ano: number, meta: Partial<MetaGlobal>) => void;
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

const STORAGE_KEY = 'cgp-data';

export function AppProvider({ children }: { children: ReactNode }) {
  const [cursos, setCursos] = useState<Curso[]>(() => {
    const stored = localStorage.getItem(`${STORAGE_KEY}-cursos`);
    return stored ? JSON.parse(stored) : initialCursos;
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    const stored = localStorage.getItem(`${STORAGE_KEY}-leads`);
    return stored ? JSON.parse(stored) : initialLeads;
  });

  const [professores, setProfessores] = useState<Professor[]>(() => {
    const stored = localStorage.getItem(`${STORAGE_KEY}-professores`);
    return stored ? JSON.parse(stored) : initialProfessores;
  });

  const [vendedoras, setVendedoras] = useState<Vendedora[]>(() => {
    const stored = localStorage.getItem(`${STORAGE_KEY}-vendedoras`);
    return stored ? JSON.parse(stored) : initialVendedoras;
  });

  const [metasGlobais, setMetasGlobais] = useState<MetaGlobal[]>(() => {
    const stored = localStorage.getItem(`${STORAGE_KEY}-metas-globais`);
    return stored ? JSON.parse(stored) : initialMetasGlobais;
  });

  const [taxasComissao, setTaxasComissao] = useState<TaxaComissao[]>(() => {
    const stored = localStorage.getItem(`${STORAGE_KEY}-taxas-comissao`);
    return stored ? JSON.parse(stored) : initialTaxasComissao;
  });

  const [anoSelecionado, setAnoSelecionado] = useState<number>(2025);

  // Clientes não são mais armazenados, são derivados dos leads
  const extractClientesFromLeads = (): Cliente[] => {
    const clientesMap = new Map<string, Cliente>();
    
    leads
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
    
    // Identificar clientes recorrentes (2+ cursos)
    const clientes = Array.from(clientesMap.values());
    clientes.forEach(cliente => {
      cliente.recorrente = cliente.historicoCursos.length >= 2;
    });
    
    return clientes;
  };

  const clientes = extractClientesFromLeads();

  // Meta total é calculada dinamicamente a partir das metas individuais
  const metaTotalAnual = vendedoras.reduce((sum, v) => sum + v.metaAnual, 0);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}-cursos`, JSON.stringify(cursos));
  }, [cursos]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}-leads`, JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}-professores`, JSON.stringify(professores));
  }, [professores]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}-vendedoras`, JSON.stringify(vendedoras));
  }, [vendedoras]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}-metas-globais`, JSON.stringify(metasGlobais));
  }, [metasGlobais]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}-taxas-comissao`, JSON.stringify(taxasComissao));
  }, [taxasComissao]);

  // Clientes não são mais persistidos pois são derivados dinamicamente

  // Função para obter inscrições de um curso dinamicamente
  const getCursoInscricoes = (cursoId: number): number => {
    return getInscricoesCurso(leads, cursoId);
  };

  // Cursos
  const addCurso = (curso: Omit<Curso, 'id'>) => {
    const newCurso = { ...curso, id: Date.now() };
    setCursos([...cursos, newCurso]);
  };

  const updateCurso = (id: number, updates: Partial<Curso>) => {
    setCursos(cursos.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCurso = (id: number) => {
    setCursos(cursos.filter(c => c.id !== id));
    // Remove leads relacionados
    setLeads(leads.filter(l => l.cursoId !== id));
  };

  // Leads
  const addLead = (lead: Omit<Lead, 'id'>) => {
    const newLead = { ...lead, id: Date.now() };
    setLeads([...leads, newLead]);
  };

  const updateLead = (id: number, updates: Partial<Lead>) => {
    setLeads(prevLeads => {
      return prevLeads.map(l => {
        if (l.id === id) {
          const oldLead = l;
          const newLead = { ...l, ...updates };
          
          // Se mudou status de/para "Inscrição Realizada", recalcular será automático
          // pois usamos getInscricoesCurso que lê o estado atual
          
          return newLead;
        }
        return l;
      });
    });
  };

  const deleteLead = (id: number) => {
    setLeads(leads.filter(l => l.id !== id));
  };

  const moveLeadStatus = (id: number, newStatus: Lead['status'], motivoPerda?: Lead['motivoPerda'], observacoes?: string) => {
    setLeads(prevLeads => {
      return prevLeads.map(l => {
        if (l.id === id) {
          const updates: Partial<Lead> = { status: newStatus };
          
          if (newStatus === 'Inscrição Realizada') {
            updates.dataConversao = new Date().toISOString().split('T')[0];
            updates.motivoPerda = undefined;
            // Não precisa mais atualizar manualmente - getInscricoesCurso calcula dinamicamente
          } else if (newStatus === 'Proposta Declinada') {
            updates.motivoPerda = motivoPerda;
            updates.observacoes = observacoes;
          }
          
          return { ...l, ...updates };
        }
        return l;
      });
    });
  };

  // Professores
  const addProfessor = (professor: Omit<Professor, 'id'>) => {
    const newProfessor = { ...professor, id: Date.now() };
    setProfessores([...professores, newProfessor]);
  };

  const updateProfessor = (id: number, updates: Partial<Professor>) => {
    setProfessores(professores.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProfessor = (id: number) => {
    setProfessores(professores.filter(p => p.id !== id));
  };

  // Vendedoras
  const updateVendedoraMeta = (id: number, metaMensal: number, metaAnual: number) => {
    setVendedoras(vendedoras.map(v => v.id === id ? { ...v, metaMensal, metaAnual } : v));
    // metaTotalAnual é recalculado automaticamente como campo derivado
  };

  const setMetaTotalAnual = (meta: number) => {
    // Distribuir a meta proporcionalmente entre as vendedoras
    const totalAtual = vendedoras.reduce((sum, v) => sum + v.metaAnual, 0);
    if (totalAtual === 0) return;
    
    const fator = meta / totalAtual;
    setVendedoras(vendedoras.map(v => ({
      ...v,
      metaAnual: Math.round(v.metaAnual * fator),
      metaMensal: Math.round((v.metaAnual * fator) / 12)
    })));
  };

  // Metas Globais
  const getMetaGlobalByAno = (ano: number): MetaGlobal | undefined => {
    return metasGlobais.find(m => m.ano === ano);
  };

  const updateMetaGlobal = (ano: number, updates: Partial<MetaGlobal>) => {
    setMetasGlobais(metas => {
      const existingIndex = metas.findIndex(m => m.ano === ano);
      if (existingIndex >= 0) {
        const updated = [...metas];
        updated[existingIndex] = { ...updated[existingIndex], ...updates };
        return updated;
      } else {
        return [...metas, { ano, valor: 0, descricao: '', ...updates }];
      }
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

  // Comissões
  const addTaxaComissao = (taxa: Omit<TaxaComissao, 'id'>) => {
    const newTaxa = { ...taxa, id: Date.now() };
    setTaxasComissao([...taxasComissao, newTaxa]);
  };

  const updateTaxaComissao = (id: number, updates: Partial<TaxaComissao>) => {
    setTaxasComissao(taxas => taxas.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTaxaComissao = (id: number) => {
    setTaxasComissao(taxas => taxas.filter(t => t.id !== id));
  };

  const getTaxaComissao = (vendedoraId: number, cursoId: number): number => {
    // Hierarquia: Específica (vendedora + curso) > Por vendedora > Por curso > Padrão
    
    // 1. Específica (vendedora + curso)
    let taxa = taxasComissao.find(t => 
      t.vendedoraId === vendedoraId && t.cursoId === cursoId
    );
    
    // 2. Por vendedora (qualquer curso)
    if (!taxa) {
      taxa = taxasComissao.find(t => 
        t.vendedoraId === vendedoraId && !t.cursoId
      );
    }
    
    // 3. Por curso (qualquer vendedora)
    if (!taxa) {
      taxa = taxasComissao.find(t => 
        t.cursoId === cursoId && !t.vendedoraId
      );
    }
    
    // 4. Padrão
    if (!taxa) {
      taxa = taxasComissao.find(t => !t.vendedoraId && !t.cursoId);
    }
    
    return taxa?.taxa ?? 0;
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
    getInscricoesCurso: getCursoInscricoes,
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
