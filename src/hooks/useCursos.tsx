import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Curso = Tables<'cursos'>;
type CursoInsert = TablesInsert<'cursos'>;
type CursoUpdate = TablesUpdate<'cursos'>;

export function useCursos() {
  const queryClient = useQueryClient();

  const { data: cursos = [], isLoading } = useQuery({
    queryKey: ['cursos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cursos')
        .select('*')
        .order('data_inicio', { ascending: false });
      
      if (error) throw error;
      return data as Curso[];
    },
  });

  const addCurso = useMutation({
    mutationFn: async (curso: Omit<CursoInsert, 'id'>) => {
      const { data, error } = await supabase
        .from('cursos')
        .insert([curso])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cursos'] });
      toast.success('Curso criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar curso: ' + error.message);
    },
  });

  const updateCurso = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: CursoUpdate }) => {
      const { data, error } = await supabase
        .from('cursos')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cursos'] });
      toast.success('Curso atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar curso: ' + error.message);
    },
  });

  const deleteCurso = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('cursos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cursos'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Curso excluído com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir curso: ' + error.message);
    },
  });

  return {
    cursos,
    isLoading,
    addCurso: addCurso.mutateAsync,
    updateCurso: (id: number, updates: CursoUpdate) => updateCurso.mutateAsync({ id, updates }),
    deleteCurso: deleteCurso.mutateAsync,
  };
}
