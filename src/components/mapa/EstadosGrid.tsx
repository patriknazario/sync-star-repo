import { EstadoCard } from './EstadoCard';
import { REGIOES } from '@/data/estadosData';

interface EstadoInfo {
  sigla: string;
  nome: string;
  totalCursos: number;
}

interface EstadosGridProps {
  estadosData: Map<string, EstadoInfo>;
  selectedState: string | null;
  onSelectState: (sigla: string) => void;
  maxCursos: number;
}

export function EstadosGrid({ 
  estadosData, 
  selectedState, 
  onSelectState, 
  maxCursos 
}: EstadosGridProps) {
  return (
    <div className="space-y-8">
      {Object.entries(REGIOES).map(([regiao, siglas]) => {
        // Filtrar estados da região que têm dados
        const estadosDaRegiao = siglas
          .map(sigla => {
            const estado = estadosData.get(sigla);
            return estado ? { sigla, ...estado } : null;
          })
          .filter(Boolean);

        // Não renderizar região vazia
        if (estadosDaRegiao.length === 0) return null;

        return (
          <div key={regiao} className="space-y-3">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded" />
              {regiao}
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {estadosDaRegiao.map((estado) => (
                <EstadoCard
                  key={estado!.sigla}
                  sigla={estado!.sigla}
                  nome={estado!.nome}
                  totalCursos={estado!.totalCursos}
                  maxCursos={maxCursos}
                  isSelected={selectedState === estado!.sigla}
                  onClick={() => onSelectState(estado!.sigla)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
