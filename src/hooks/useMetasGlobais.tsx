import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type MetaGlobal = Tables<'metas_globais'>;
type MetaGlobalUpdate = TablesUpdate<'metas_globais'>;

export function useMetasGlobais() {
  const queryClient = useQueryClient();

  const { data: metasGlobais = [], isLoading } = useQuery({
    queryKey: ['metas_globais'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('metas_globais')
        .select('*')
        .order('ano', { ascending: false });
      
      if (error) throw error;
      return data as MetaGlobal[];
    },
  });

  const updateMetaGlobal = useMutation({
    mutationFn: async ({ ano, updates }: { ano: number; updates: MetaGlobalUpdate }) => {
      const { data: existing } = await supabase
        .from('metas_globais')
        .select('*')
        .eq('ano', ano)
        .single();

      if (existing) {
        const { data, error } = await supabase
          .from('metas_globais')
          .update(updates)
          .eq('ano', ano)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('metas_globais')
          .insert([{ ano, ...updates }])
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metas_globais'] });
      toast.success('Meta global atualizada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar meta global: ' + error.message);
    },
  });

  return {
    metasGlobais,
    isLoading,
    updateMetaGlobal: (ano: number, updates: MetaGlobalUpdate) => 
      updateMetaGlobal.mutateAsync({ ano, updates }),
    getMetaGlobalByAno: (ano: number) => metasGlobais.find(m => m.ano === ano),
  };
}
