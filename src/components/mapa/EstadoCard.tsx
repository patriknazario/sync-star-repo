import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EstadoCardProps {
  sigla: string;
  nome: string;
  totalCursos: number;
  maxCursos: number;
  isSelected: boolean;
  onClick: () => void;
}

export function EstadoCard({ 
  sigla, 
  nome, 
  totalCursos, 
  maxCursos, 
  isSelected, 
  onClick 
}: EstadoCardProps) {
  // Calcular intensidade da cor (0-1)
  const intensity = maxCursos > 0 ? totalCursos / maxCursos : 0;
  
  // Gradiente de primary baseado na intensidade
  const getBackgroundColor = () => {
    if (totalCursos === 0) return 'bg-muted';
    if (intensity < 0.2) return 'bg-primary/10';
    if (intensity < 0.4) return 'bg-primary/30';
    if (intensity < 0.6) return 'bg-primary/50';
    if (intensity < 0.8) return 'bg-primary/70';
    return 'bg-primary';
  };

  const getTextColor = () => {
    if (totalCursos === 0) return 'text-muted-foreground';
    if (intensity < 0.6) return 'text-foreground';
    return 'text-primary-foreground';
  };

  return (
    <button
      onClick={onClick}
      className={`w-full transition-all duration-200 hover:scale-105 group ${
        isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
      }`}
    >
      <Card className={`p-4 h-24 flex flex-col justify-between ${getBackgroundColor()} border-2 ${
        isSelected ? 'border-primary' : 'border-transparent'
      } group-hover:bg-accent group-hover:border-accent`}>
        <div className="flex items-start justify-between">
          <span className={`text-2xl font-bold ${getTextColor()} group-hover:text-accent-foreground`}>{sigla}</span>
          {totalCursos > 0 && (
            <Badge variant="secondary" className="text-xs">
              {totalCursos}
            </Badge>
          )}
        </div>
        <span className={`text-xs font-medium ${getTextColor()} group-hover:text-accent-foreground line-clamp-1`}>
          {nome}
        </span>
      </Card>
    </button>
  );
}
