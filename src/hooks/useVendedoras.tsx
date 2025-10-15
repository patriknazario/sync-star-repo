import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Vendedora = Tables<'vendedoras'>;
type VendedoraUpdate = TablesUpdate<'vendedoras'>;

export function useVendedoras(ano?: number) {
  const queryClient = useQueryClient();
  const anoFiltro = ano || new Date().getFullYear();

  const { data: vendedoras = [], isLoading } = useQuery({
    queryKey: ['vendedoras', anoFiltro],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendedoras')
        .select('*')
        .eq('ano', anoFiltro)
        .order('nome');
      
      if (error) throw error;
      return data as Vendedora[];
    },
  });

  const updateVendedoraMeta = useMutation({
    mutationFn: async ({ 
      id, 
      meta_mensal, 
      meta_anual 
    }: { 
      id: number; 
      meta_mensal: number; 
      meta_anual: number;
    }) => {
      const { data, error } = await supabase
        .from('vendedoras')
        .update({ meta_mensal, meta_anual })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendedoras'] });
      toast.success('Meta atualizada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar meta: ' + error.message);
    },
  });

  return {
    vendedoras,
    isLoading,
    updateVendedoraMeta: (id: number, metaMensal: number, metaAnual: number) => 
      updateVendedoraMeta.mutateAsync({ id, meta_mensal: metaMensal, meta_anual: metaAnual }),
  };
}
