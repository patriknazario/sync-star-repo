import { useAuth } from '@/contexts/AuthContext';

export function useRoleAccess() {
  const { userRole, isAdmin, isVendedora, isGerente } = useAuth();

  return {
    // ===== CURSOS =====
    canCreateCursos: isAdmin,
    canEditCursos: isAdmin,
    canDeleteCursos: isAdmin,
    canViewCursos: true, // Todos podem ver
    
    // ===== LEADS (CRM) =====
    canCreateLeads: true, // Vendedoras, gerentes e admins
    canEditLeads: true,   // Vendedoras podem editar QUALQUER lead
    canDeleteLeads: true, // Vendedoras podem deletar QUALQUER lead
    canViewAllLeads: true, // Todos podem ver todos os leads
    
    // ===== METAS =====
    canEditMetasGlobais: isAdmin, // Apenas admin
    canViewMetasGlobais: true,    // Todos podem ver
    canEditOwnMeta: isVendedora,  // Vendedoras podem editar meta pessoal (futuro)
    
    // ===== TAXAS DE COMISSÃO =====
    canEditTaxasComissao: isAdmin, // Apenas admin
    canViewTaxasComissao: true,    // Todos podem ver
    
    // ===== PROFESSORES =====
    canCreateProfessores: isAdmin,
    canEditProfessores: isAdmin,
    canDeleteProfessores: isAdmin,
    canViewProfessores: true, // Todos podem ver
    
    // ===== PERFORMANCE =====
    canViewOwnPerformance: true,
    canViewAllPerformance: true, // Todos podem ver performance de todos
    
    // ===== VENDEDORAS =====
    canEditOtherVendedoras: isAdmin, // Apenas admin edita outras vendedoras
    canEditOwnVendedora: isVendedora, // Vendedora edita apenas seus dados
    
    // Helpers
    isAdmin,
    isVendedora,
    isGerente,
  };
}
