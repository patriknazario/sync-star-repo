import { Badge } from '@/components/ui/badge';
import { Curso, Lead } from '@/data/mockData';

interface StatusBadgeProps {
  status: Curso['status'] | Lead['status'];
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getVariant = () => {
    switch (status) {
      case 'Planejado':
        return 'secondary';
      case 'Inscrições Abertas':
      case 'Proposta Enviada':
        return 'default';
      case 'Em Andamento':
        return 'default';
      case 'Inscrição Realizada':
        return 'default';
      case 'Concluído':
        return 'secondary';
      case 'Cancelado':
      case 'Proposta Declinada':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getCustomStyles = () => {
    switch (status) {
      case 'Inscrições Abertas':
      case 'Inscrição Realizada':
        return 'bg-success text-success-foreground hover:bg-success/90';
      case 'Em Andamento':
      case 'Proposta Enviada':
        return 'bg-primary text-primary-foreground hover:bg-primary/90';
      case 'Concluído':
        return 'bg-purple-500 text-white hover:bg-purple-600';
      case 'Planejado':
        return 'bg-muted text-muted-foreground hover:bg-muted/80';
      default:
        return '';
    }
  };

  return (
    <Badge variant={getVariant()} className={getCustomStyles()}>
      {status}
    </Badge>
  );
}
