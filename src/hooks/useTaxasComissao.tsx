import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TaxaComissao {
  id: string;
  taxa: number;
  vendedora_id?: string;
  curso_id?: string;
  tipo: 'Padrão' | 'Específica';
}

export function useTaxasComissao() {
  const queryClient = useQueryClient();

  const { data: taxasComissao = [], isLoading } = useQuery({
    queryKey: ['taxas-comissao'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('taxas_comissao')
        .select('*')
        .order('tipo', { ascending: true });
      
      if (error) throw error;
      return data as TaxaComissao[];
    }
  });

  const updateTaxaComissao = useMutation({
    mutationFn: async ({ id, ...taxa }: Partial<TaxaComissao> & { id: string }) => {
      const { data, error } = await supabase
        .from('taxas_comissao')
        .update(taxa)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxas-comissao'] });
      toast.success('Taxa de comissão atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar taxa de comissão:', error);
      toast.error('Erro ao atualizar taxa de comissão');
    }
  });

  const addTaxaComissao = useMutation({
    mutationFn: async (taxa: Omit<TaxaComissao, 'id'>) => {
      const { data, error } = await supabase
        .from('taxas_comissao')
        .insert(taxa)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxas-comissao'] });
      toast.success('Taxa de comissão criada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar taxa de comissão:', error);
      toast.error('Erro ao criar taxa de comissão');
    }
  });

  const deleteTaxaComissao = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('taxas_comissao')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxas-comissao'] });
      toast.success('Taxa de comissão excluída com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao excluir taxa de comissão:', error);
      toast.error('Erro ao excluir taxa de comissão');
    }
  });

  return {
    taxasComissao,
    isLoading,
    updateTaxaComissao: updateTaxaComissao.mutateAsync,
    addTaxaComissao: addTaxaComissao.mutateAsync,
    deleteTaxaComissao: deleteTaxaComissao.mutateAsync,
  };
}
