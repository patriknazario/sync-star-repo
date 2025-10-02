import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Curso, Professor } from '@/data/mockData';
import { Calendar, MapPin, User, Users, AlertTriangle, Plus, Edit } from 'lucide-react';
import { formatDate, shouldShowViabilityAlert } from '@/utils/calculations';
import { useApp } from '@/contexts/AppContext';

interface CursoCardProps {
  curso: Curso;
  professor?: Professor;
  onAddLead: (cursoId: number) => void;
  onEdit: (cursoId: number) => void;
}

export function CursoCard({ curso, professor, onAddLead, onEdit }: CursoCardProps) {
  const { getInscricoesCurso } = useApp();
  const inscricoes = getInscricoesCurso(curso.id);
  const showAlert = shouldShowViabilityAlert(inscricoes, curso.dataInicio);

  return (
    <Card className={`p-6 hover:shadow-lg transition-all ${showAlert ? 'border-warning border-2' : ''}`}>
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
          <span>{professor?.nome || 'Professor não encontrado'}</span>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-2 text-primary" />
          <span>{curso.cidade}, {curso.estado}</span>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-2 text-primary" />
          <span>{formatDate(curso.dataInicio)} - {formatDate(curso.dataTermino)}</span>
        </div>
        
        <div className="flex items-center text-sm text-foreground font-semibold">
          <Users className="h-4 w-4 mr-2 text-accent" />
          <span>{inscricoes} inscrições confirmadas</span>
        </div>
      </div>

      <div className="flex space-x-2">
        <Button
          onClick={() => onAddLead(curso.id)}
          className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Lead
        </Button>
        
        <Button
          onClick={() => onEdit(curso.id)}
          variant="outline"
          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
