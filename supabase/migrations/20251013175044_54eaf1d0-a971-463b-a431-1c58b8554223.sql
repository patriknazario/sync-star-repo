-- ============================================
-- CORREÇÃO: Vendedoras podem gerenciar TODOS os leads
-- ============================================

-- 1. Remover política antiga restritiva
drop policy if exists "Vendedoras can manage own leads" on public.leads;

-- 2. Criar nova política: Vendedoras podem gerenciar TODOS os leads
create policy "Vendedoras can manage all leads"
on public.leads for all
to authenticated
using (
  public.has_role(auth.uid(), 'vendedora'::app_role) OR
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'gerente'::app_role)
)
with check (
  public.has_role(auth.uid(), 'vendedora'::app_role) OR
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'gerente'::app_role)
);