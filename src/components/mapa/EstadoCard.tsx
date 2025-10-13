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
  
  // Gradiente de azul baseado na intensidade
  const getBackgroundColor = () => {
    if (totalCursos === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (intensity < 0.2) return 'bg-blue-100 dark:bg-blue-950';
    if (intensity < 0.4) return 'bg-blue-200 dark:bg-blue-900';
    if (intensity < 0.6) return 'bg-blue-300 dark:bg-blue-800';
    if (intensity < 0.8) return 'bg-blue-400 dark:bg-blue-700';
    return 'bg-blue-500 dark:bg-blue-600';
  };

  const getTextColor = () => {
    if (totalCursos === 0) return 'text-muted-foreground';
    if (intensity < 0.6) return 'text-gray-900 dark:text-gray-100';
    return 'text-white';
  };

  return (
    <button
      onClick={onClick}
      className={`w-full transition-all duration-200 hover:scale-105 ${
        isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
      }`}
    >
      <Card className={`p-4 h-24 flex flex-col justify-between ${getBackgroundColor()} border-2 ${
        isSelected ? 'border-primary' : 'border-transparent'
      }`}>
        <div className="flex items-start justify-between">
          <span className={`text-2xl font-bold ${getTextColor()}`}>{sigla}</span>
          {totalCursos > 0 && (
            <Badge variant="secondary" className="text-xs">
              {totalCursos}
            </Badge>
          )}
        </div>
        <span className={`text-xs font-medium ${getTextColor()} line-clamp-1`}>
          {nome}
        </span>
      </Card>
    </button>
  );
}
