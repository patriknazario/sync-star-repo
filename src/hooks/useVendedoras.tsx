import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Vendedora {
  id: string;
  nome: string;
  email: string;
  user_id?: string;
  meta_mensal: number;
  meta_anual: number;
}

export function useVendedoras() {
  const queryClient = useQueryClient();

  const { data: vendedoras = [], isLoading } = useQuery({
    queryKey: ['vendedoras'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendedoras')
        .select('*')
        .order('nome', { ascending: true });
      
      if (error) throw error;
      return data as Vendedora[];
    }
  });

  const updateVendedora = useMutation({
    mutationFn: async ({ id, ...vendedora }: Partial<Vendedora> & { id: string }) => {
      const { data, error } = await supabase
        .from('vendedoras')
        .update(vendedora)
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
      console.error('Erro ao atualizar vendedora:', error);
      toast.error('Erro ao atualizar meta');
    }
  });

  return {
    vendedoras,
    isLoading,
    updateVendedora: updateVendedora.mutateAsync,
  };
}
