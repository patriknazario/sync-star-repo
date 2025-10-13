import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Curso } from '@/hooks/useCursos';
import { Calendar, MapPin, User, Users, AlertTriangle, Plus, Edit, DollarSign } from 'lucide-react';
import { formatDate, shouldShowViabilityAlert, getFaturamentoCurso, formatCurrency, getInscricoesCurso } from '@/utils/calculations';
import { useLeads } from '@/hooks/useLeads';
import { useNavigate } from 'react-router-dom';

interface CursoCardProps {
  curso: Curso;
  professorNome?: string;
  onAddLead: (cursoId: string) => void;
  onEdit: (cursoId: string) => void;
}

export function CursoCard({ curso, professorNome, onAddLead, onEdit }: CursoCardProps) {
  const { leads } = useLeads();
  const navigate = useNavigate();
  const inscricoes = getInscricoesCurso(leads, curso.id);
  const faturamento = getFaturamentoCurso(leads, curso.id);
  const showAlert = shouldShowViabilityAlert(inscricoes, curso.data_inicio);

  const handleCardClick = () => {
    navigate(`/curso/${curso.id}`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(curso.id);
  };

  const handleAddLeadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddLead(curso.id);
  };

  return (
    <Card 
      onClick={handleCardClick}
      className={`p-6 hover:shadow-lg transition-all cursor-pointer ${showAlert ? 'border-warning border-2' : ''}`}
    >
      {showAlert && (
        <div className="mb-4 p-3 bg-warning/10 border border-warning rounded-lg flex items-start space-x-2">
          <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-warning">Atenção: Viabilidade em risco!</p>
            <p className="text-muted-foreground">Apenas {inscricoes} inscrições confirmadas</p>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground mb-2">{curso.tema}</h3>
          <StatusBadge status={curso.status} />
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <User className="h-4 w-4 mr-2 text-primary" />
          <span>{professorNome || 'Professor não encontrado'}</span>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-2 text-primary" />
          <span>{curso.cidade}, {curso.estado}</span>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-2 text-primary" />
          <span>{formatDate(curso.data_inicio)} - {formatDate(curso.data_termino)}</span>
        </div>
        
        <div className="flex items-center text-sm text-foreground font-semibold">
          <Users className="h-4 w-4 mr-2 text-accent" />
          <span>{inscricoes} inscrições confirmadas</span>
        </div>
        
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-border">
          <div className="flex items-center text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4 mr-2 text-success" />
            <span>Faturamento</span>
          </div>
          <span className="text-lg font-bold text-success">
            {formatCurrency(faturamento)}
          </span>
        </div>
      </div>

      <div className="flex space-x-2">
        <Button
          onClick={handleAddLeadClick}
          className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Lead
        </Button>
        
        <Button
          onClick={handleEditClick}
          variant="outline"
          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
