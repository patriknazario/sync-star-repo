import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

interface EstadoInfo {
  sigla: string;
  nome: string;
  totalCursos: number;
}

interface EstadoTopRankingProps {
  topEstados: [string, EstadoInfo][];
  onSelectEstado: (sigla: string) => void;
  selectedState: string | null;
}

export function EstadoTopRanking({ topEstados, onSelectEstado, selectedState }: EstadoTopRankingProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-yellow-500" />
        <h3 className="text-lg font-bold">Top 5 Estados</h3>
      </div>
      
      <div className="space-y-2">
        {topEstados.map(([sigla, estado], index) => (
          <button
            key={sigla}
            onClick={() => onSelectEstado(sigla)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-accent ${
              selectedState === sigla ? 'bg-accent' : ''
            }`}
          >
            <Badge 
              variant="outline" 
              className="min-w-[32px] h-8 flex items-center justify-center font-bold text-base"
            >
              #{index + 1}
            </Badge>
            <div className="flex-1 text-left">
              <p className="font-medium">{estado.nome}</p>
              <p className="text-sm text-muted-foreground">
                <span className="font-bold text-primary">{estado.totalCursos}</span> curso{estado.totalCursos !== 1 ? 's' : ''}
              </p>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}
