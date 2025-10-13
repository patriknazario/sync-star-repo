import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Lead {
  id: string;
  curso_id: string;
  nome_responsavel: string;
  orgao: string;
  setor?: string;
  cidade: string;
  estado: string;
  telefone?: string;
  email?: string;
  quantidade_inscricoes: number;
  valor_proposta: number;
  valor_negociado?: number;
  vendedora_id: string;
  status: 'Proposta Enviada' | 'Inscrição Realizada' | 'Proposta Declinada';
  data_cadastro: string;
  data_conversao?: string;
  motivo_perda?: 'Preço' | 'Data do curso incompatível' | 'Sem orçamento';
  observacoes?: string;
}

export function useLeads() {
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('data_cadastro', { ascending: false });
      
      if (error) throw error;
      return data as Lead[];
    }
  });

  const addLead = useMutation({
    mutationFn: async (lead: Omit<Lead, 'id'>) => {
      const { data, error } = await supabase
        .from('leads')
        .insert(lead)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead criado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar lead:', error);
      toast.error('Erro ao criar lead');
    }
  });

  const updateLead = useMutation({
    mutationFn: async ({ id, ...lead }: Partial<Lead> & { id: string }) => {
      const { data, error } = await supabase
        .from('leads')
        .update(lead)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar lead:', error);
      toast.error('Erro ao atualizar lead');
    }
  });

  const deleteLead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao excluir lead:', error);
      toast.error('Erro ao excluir lead');
    }
  });

  return {
    leads,
    isLoading,
    addLead: addLead.mutateAsync,
    updateLead: updateLead.mutateAsync,
    deleteLead: deleteLead.mutateAsync,
  };
}
