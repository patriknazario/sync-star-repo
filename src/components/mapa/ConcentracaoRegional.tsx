import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ConcentracaoItem {
  nome: string;
  cursos: number;
  percentual: string;
}

interface ConcentracaoRegionalProps {
  concentracao: ConcentracaoItem[];
}

export function ConcentracaoRegional({ concentracao }: ConcentracaoRegionalProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-4">Concentração Regional</h3>
      
      <div className="space-y-4">
        {concentracao
          .filter(item => item.cursos > 0)
          .map((item) => (
            <div key={item.nome}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{item.nome}</span>
                <span className="text-sm font-bold text-primary">
                  {item.cursos} curso{item.cursos !== 1 ? 's' : ''} ({item.percentual}%)
                </span>
              </div>
              <Progress value={parseFloat(item.percentual)} className="h-2" />
            </div>
          ))}
      </div>
    </Card>
  );
}
