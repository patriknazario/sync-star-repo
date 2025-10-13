import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PerformanceVendedora {
  id: string;
  nome: string;
  email: string;
  meta_mensal: number;
  meta_anual: number;
  total_leads: number;
  leads_convertidos: number;
  total_inscricoes: number;
  faturamento_total: number;
  taxa_conversao: number;
}

export function usePerformanceVendedoras() {
  const { data: performance = [], isLoading } = useQuery({
    queryKey: ['performance-vendedoras'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('view_performance_vendedoras')
        .select('*')
        .order('faturamento_total', { ascending: false });
      
      if (error) throw error;
      return data as PerformanceVendedora[];
    }
  });

  return {
    performance,
    isLoading,
  };
}
