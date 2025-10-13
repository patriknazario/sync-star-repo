import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Users, Calendar, DollarSign, User, AlertCircle } from 'lucide-react';
import { Curso, Vendedora, Professor } from '@/data/mockData';
import { formatCurrency, formatDate, getDaysUntil } from '@/utils/calculations';
import { Progress } from '@/components/ui/progress';

interface EstadoInfo {
  sigla: string;
  nome: string;
  totalCursos: number;
  totalInscricoes: number;
  receitaPrevista: number;
  cidades: string[];
  cursos: Curso[];
  vendedoraResponsavel?: Vendedora;
}

interface EstadoModalProps {
  estado: EstadoInfo | null;
  isOpen: boolean;
  onClose: () => void;
  vendedoras: Vendedora[];
  professores: Professor[];
  onUpdateResponsavel: (estadoSigla: string, vendedoraId: number) => void;
  inscricoesPorCurso: Map<number, number>;
}

export function EstadoModal({ 
  estado, 
  isOpen, 
  onClose, 
  vendedoras, 
  professores,
  onUpdateResponsavel,
  inscricoesPorCurso
}: EstadoModalProps) {
  const [vendedoraId, setVendedoraId] = useState<string>(
    estado?.vendedoraResponsavel?.id.toString() || ''
  );

  if (!estado) return null;

  const handleSaveResponsavel = () => {
    if (vendedoraId) {
      onUpdateResponsavel(estado.sigla, parseInt(vendedoraId));
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      'Programado': { variant: 'default', label: 'Confirmado' },
      'Em Andamento': { variant: 'secondary', label: 'Em Andamento' },
      'Concluído': { variant: 'outline', label: 'Concluído' }
    };
    
    const config = variants[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getProfessorNome = (professorId: number) => {
    return professores.find(p => p.id === professorId)?.nome || 'Não definido';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <MapPin className="h-6 w-6 text-primary" />
            {estado.nome}
          </DialogTitle>
          <div className="flex flex-wrap gap-1 mt-2">
            {estado.cidades.map((cidade) => (
              <Badge key={cidade} variant="secondary" className="text-xs">
                {cidade}
              </Badge>
            ))}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Card do Responsável */}
          <Card className="p-4 bg-blue-50 dark:bg-blue-950/30">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-primary" />
              <h4 className="font-bold">Responsável Regional</h4>
            </div>
            
            {estado.vendedoraResponsavel ? (
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{estado.vendedoraResponsavel.nome}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  <span className="text-muted-foreground">Meta Anual: {formatCurrency(estado.vendedoraResponsavel.metaAnual)}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-3">Nenhuma vendedora responsável definida</p>
            )}

            <div className="flex gap-2">
              <Select value={vendedoraId} onValueChange={setVendedoraId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecionar vendedora..." />
                </SelectTrigger>
                <SelectContent>
                  {vendedoras.map((v) => (
                    <SelectItem key={v.id} value={v.id.toString()}>
                      {v.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleSaveResponsavel} disabled={!vendedoraId}>
                Salvar
              </Button>
            </div>
          </Card>

          {/* Métricas do Estado */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-blue-500" />
                <p className="text-xs text-muted-foreground">Cursos 2025</p>
              </div>
              <p className="text-2xl font-bold">{estado.totalCursos}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-green-500" />
                <p className="text-xs text-muted-foreground">Inscrições</p>
              </div>
              <p className="text-2xl font-bold">{estado.totalInscricoes}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-purple-500" />
                <p className="text-xs text-muted-foreground">Receita</p>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(estado.receitaPrevista)}</p>
            </Card>
          </div>

          {/* Lista de Cursos */}
          <div>
            <h4 className="font-bold mb-3">Cursos Programados</h4>
            <div className="space-y-3">
              {estado.cursos.map((curso) => {
                const inscricoes = inscricoesPorCurso.get(curso.id) || 0;
                const diasRestantes = getDaysUntil(curso.dataInicio);
                const showAlert = diasRestantes > 0 && diasRestantes <= 30;
                const occupancyPercent = 100; // Sem dados de vagas, assumimos 100%

                return (
                  <Card key={curso.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h5 className="font-bold text-base">{curso.tema}</h5>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(curso.dataInicio)} a {formatDate(curso.dataTermino)}
                        </p>
                      </div>
                      {getStatusBadge(curso.status)}
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Valor</p>
                        <p className="font-bold text-sm">{formatCurrency(curso.valorInscricao)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Inscrições</p>
                        <p className="font-bold text-sm">{inscricoes}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Professor</p>
                        <p className="font-bold text-sm truncate">{getProfessorNome(curso.professorId)}</p>
                      </div>
                    </div>

                    {showAlert && (
                      <div className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-950/30 rounded mb-3">
                        <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0" />
                        <p className="text-xs text-orange-700 dark:text-orange-300">
                          Curso próximo! Faltam {diasRestantes} dia{diasRestantes !== 1 ? 's' : ''}.
                        </p>
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium">{inscricoes} inscrições</span>
                      </div>
                      <Progress 
                        value={occupancyPercent} 
                        className="h-2"
                      />
                    </div>

                    <Button className="w-full mt-3" variant="outline" size="sm">
                      Link de Inscrição
                    </Button>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
