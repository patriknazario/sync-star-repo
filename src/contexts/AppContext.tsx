import React, { createContext, useContext, useState, ReactNode } from 'react';

/**
 * CONTEXTO SIMPLIFICADO - MIGRADO PARA SUPABASE
 * 
 * Os dados agora são gerenciados pelos hooks React Query:
 * - useCursos() - para cursos
 * - useLeads() - para leads
 * - useVendedoras() - para vendedoras
 * - useProfessores() - para professores
 * - useMetasGlobais() - para metas globais
 * - useTaxasComissao() - para taxas de comissão
 * 
 * Este contexto mantém apenas o estado compartilhado do ano selecionado.
 */

interface AppContextType {
  anoSelecionado: number;
  setAnoSelecionado: (ano: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [anoSelecionado, setAnoSelecionado] = useState<number>(2025);

  const value = {
    anoSelecionado,
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
