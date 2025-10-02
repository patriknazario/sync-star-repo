import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Curso, Lead, Professor, Vendedora, Cliente, cursos as initialCursos, leads as initialLeads, professores as initialProfessores, vendedoras as initialVendedoras, clientes as initialClientes } from '@/data/mockData';
import { getInscricoesCurso } from '@/utils/calculations';

interface AppContextType {
  cursos: Curso[];
  leads: Lead[];
  professores: Professor[];
  vendedoras: Vendedora[];
  clientes: Cliente[];
  metaTotalAnual: number;
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

  const [clientes, setClientes] = useState<Cliente[]>(() => {
    const stored = localStorage.getItem(`${STORAGE_KEY}-clientes`);
    return stored ? JSON.parse(stored) : initialClientes;
  });

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
    localStorage.setItem(`${STORAGE_KEY}-clientes`, JSON.stringify(clientes));
  }, [clientes]);

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

  const value = {
    cursos,
    leads,
    professores,
    vendedoras,
    clientes,
    metaTotalAnual,
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
