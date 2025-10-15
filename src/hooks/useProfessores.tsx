import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Professor = Tables<'professores'>;
type ProfessorInsert = TablesInsert<'professores'>;
type ProfessorUpdate = TablesUpdate<'professores'>;

export function useProfessores() {
  const queryClient = useQueryClient();

  const { data: professores = [], isLoading } = useQuery({
    queryKey: ['professores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professores')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      return data as Professor[];
    },
  });

  const addProfessor = useMutation({
    mutationFn: async (professor: Omit<ProfessorInsert, 'id'>) => {
      const { data, error } = await supabase
        .from('professores')
        .insert([professor])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professores'] });
      toast.success('Professor cadastrado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao cadastrar professor: ' + error.message);
    },
  });

  const updateProfessor = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: ProfessorUpdate }) => {
      const { data, error } = await supabase
        .from('professores')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professores'] });
      toast.success('Professor atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar professor: ' + error.message);
    },
  });

  const deleteProfessor = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('professores')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professores'] });
      toast.success('Professor excluído com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir professor: ' + error.message);
    },
  });

  return {
    professores,
    isLoading,
    addProfessor: addProfessor.mutateAsync,
    updateProfessor: (id: number, updates: ProfessorUpdate) => updateProfessor.mutateAsync({ id, updates }),
    deleteProfessor: deleteProfessor.mutateAsync,
  };
}
