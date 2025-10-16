import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Lead = Tables<'leads'>;
type LeadInsert = TablesInsert<'leads'>;
type LeadUpdate = TablesUpdate<'leads'>;

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
    },
  });

  const addLead = useMutation({
    mutationFn: async (lead: Omit<LeadInsert, 'id'>) => {
      const { data, error } = await supabase
        .from('leads')
        .insert([lead])
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
      toast.error('Erro ao criar lead: ' + error.message);
    },
  });

  const updateLead = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: LeadUpdate }) => {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar lead: ' + error.message);
    },
  });

  const deleteLead = useMutation({
    mutationFn: async (id: number) => {
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
      toast.error('Erro ao excluir lead: ' + error.message);
    },
  });

  return {
    leads,
    isLoading,
    addLead: addLead.mutateAsync,
    updateLead: (id: number, updates: LeadUpdate) => updateLead.mutateAsync({ id, updates }),
    deleteLead: deleteLead.mutateAsync,
  };
}
