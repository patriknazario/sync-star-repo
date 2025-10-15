import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Curso } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Calendar as CalendarIcon, User } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface CursoDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cursos: Curso[];
  data?: Date;
}

export function CursoDetailModal({ open, onOpenChange, cursos, data }: CursoDetailModalProps) {
  const navigate = useNavigate();
  const { getInscricoesCurso, professores } = useApp();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Planejado':
        return 'default';
      case 'Inscrições Abertas':
        return 'default';
      case 'Em Andamento':
        return 'secondary';
      case 'Concluído':
        return 'outline';
      case 'Cancelado':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Cursos em {data?.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </DialogTitle>
          <DialogDescription>
            {cursos.length} {cursos.length === 1 ? 'curso encontrado' : 'cursos encontrados'} nesta data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {cursos.map((curso) => {
            const professor = professores.find((p) => p.id === curso.professorId);
            const inscricoes = getInscricoesCurso(curso.id);

            return (
              <div
                key={curso.id}
                className="border border-border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{curso.tema}</h3>
                    <Badge variant={getStatusVariant(curso.status)} className="mt-2">
                      {curso.status}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      navigate(`/cursos/${curso.id}`);
                      onOpenChange(false);
                    }}
                  >
                    Ver Detalhes
                  </Button>
                </div>

                {/* Informações */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {curso.cidade}, {curso.estado}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{curso.cargaHoraria}h</span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    <span>
                      {formatarData(curso.dataInicio)} - {formatarData(curso.dataTermino)}
                    </span>
                  </div>

                  {professor && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{professor.nome}</span>
                    </div>
                  )}
                </div>

                {/* Métricas */}
                <div className="flex gap-4 pt-2 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Inscrições</p>
                    <p className="text-lg font-semibold text-accent">
                      {inscricoes} / {(curso as any).meta_inscricoes || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Valor</p>
                    <p className="text-lg font-semibold">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(curso.valorInscricao)}
                    </p>
                  </div>
                </div>

                {/* Descrição */}
                {curso.descricao && (
                  <p className="text-sm text-muted-foreground pt-2 border-t border-border">
                    {curso.descricao}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
