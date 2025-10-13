import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Curso {
  id: string;
  tema: string;
  professor_id: string;
  cidade: string;
  estado: string;
  data_inicio: string;
  data_termino: string;
  carga_horaria: number;
  valor_inscricao: number;
  descricao: string;
  status: 'Planejado' | 'Inscrições Abertas' | 'Em Andamento' | 'Concluído' | 'Cancelado';
  professor?: {
    nome: string;
  };
}

export function useCursos() {
  const queryClient = useQueryClient();

  const { data: cursos = [], isLoading } = useQuery({
    queryKey: ['cursos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cursos')
        .select('*, professor:professores(nome)')
        .order('data_inicio', { ascending: false });
      
      if (error) throw error;
      return data as Curso[];
    }
  });

  const addCurso = useMutation({
    mutationFn: async (curso: Omit<Curso, 'id' | 'professor'>) => {
      const { data, error } = await supabase
        .from('cursos')
        .insert(curso)
        .select('*, professor:professores(nome)')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cursos'] });
      toast.success('Curso criado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar curso:', error);
      toast.error('Erro ao criar curso');
    }
  });

  const updateCurso = useMutation({
    mutationFn: async ({ id, ...curso }: Partial<Curso> & { id: string }) => {
      const { data, error } = await supabase
        .from('cursos')
        .update(curso)
        .eq('id', id)
        .select('*, professor:professores(nome)')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cursos'] });
      toast.success('Curso atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar curso:', error);
      toast.error('Erro ao atualizar curso');
    }
  });

  const deleteCurso = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cursos')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cursos'] });
      toast.success('Curso excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao excluir curso:', error);
      toast.error('Erro ao excluir curso');
    }
  });

  return {
    cursos,
    isLoading,
    addCurso: addCurso.mutateAsync,
    updateCurso: updateCurso.mutateAsync,
    deleteCurso: deleteCurso.mutateAsync,
  };
}
