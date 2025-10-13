import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MetaGlobal {
  id: string;
  ano: number;
  valor: number;
  descricao: string;
}

export function useMetasGlobais() {
  const queryClient = useQueryClient();

  const { data: metasGlobais = [], isLoading } = useQuery({
    queryKey: ['metas-globais'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('metas_globais')
        .select('*')
        .order('ano', { ascending: false });
      
      if (error) throw error;
      return data as MetaGlobal[];
    }
  });

  const updateMetaGlobal = useMutation({
    mutationFn: async ({ id, ...meta }: Partial<MetaGlobal> & { id: string }) => {
      const { data, error } = await supabase
        .from('metas_globais')
        .update(meta)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metas-globais'] });
      toast.success('Meta global atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar meta global:', error);
      toast.error('Erro ao atualizar meta global');
    }
  });

  const addMetaGlobal = useMutation({
    mutationFn: async (meta: Omit<MetaGlobal, 'id'>) => {
      const { data, error } = await supabase
        .from('metas_globais')
        .insert(meta)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metas-globais'] });
      toast.success('Meta global criada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar meta global:', error);
      toast.error('Erro ao criar meta global');
    }
  });

  return {
    metasGlobais,
    isLoading,
    updateMetaGlobal: updateMetaGlobal.mutateAsync,
    addMetaGlobal: addMetaGlobal.mutateAsync,
  };
}
