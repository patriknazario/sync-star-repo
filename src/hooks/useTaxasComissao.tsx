// Hook helper para facilitar uso do React Query com Supabase
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useSupabaseQuery<T>(
  queryKey: string[],
  query: () => Promise<{ data: T | null; error: any }>
) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await query();
      if (error) throw error;
      return data;
    },
  });
}
