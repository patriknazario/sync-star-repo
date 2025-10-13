import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Professor {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  areas: string[];
  redes_sociais?: {
    linkedin?: string;
    instagram?: string;
    site?: string;
  };
  bio?: string;
  foto?: string;
}

export function useProfessores() {
  const queryClient = useQueryClient();

  const { data: professores = [], isLoading } = useQuery({
    queryKey: ['professores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professores')
        .select('*')
        .order('nome', { ascending: true });
      
      if (error) throw error;
      return data as Professor[];
    }
  });

  const addProfessor = useMutation({
    mutationFn: async (professor: Omit<Professor, 'id'>) => {
      const { data, error } = await supabase
        .from('professores')
        .insert(professor)
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
      console.error('Erro ao cadastrar professor:', error);
      toast.error('Erro ao cadastrar professor');
    }
  });

  const updateProfessor = useMutation({
    mutationFn: async ({ id, ...professor }: Partial<Professor> & { id: string }) => {
      const { data, error } = await supabase
        .from('professores')
        .update(professor)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professores'] });
      toast.success('Professor atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar professor:', error);
      toast.error('Erro ao atualizar professor');
    }
  });

  const deleteProfessor = useMutation({
    mutationFn: async (id: string) => {
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
      console.error('Erro ao excluir professor:', error);
      toast.error('Erro ao excluir professor');
    }
  });

  return {
    professores,
    isLoading,
    addProfessor: addProfessor.mutateAsync,
    updateProfessor: updateProfessor.mutateAsync,
    deleteProfessor: deleteProfessor.mutateAsync,
  };
}
