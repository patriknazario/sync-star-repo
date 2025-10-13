import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { feature } from 'topojson-client';
import brazilTopo from '@/data/brazil-states.json';

interface EstadoInfo {
  sigla: string;
  nome: string;
  totalCursos: number;
  totalInscricoes: number;
  receitaPrevista: number;
  cidades: string[];
}

interface BrasilMapProps {
  estadosData: Map<string, EstadoInfo>;
  selectedState: string | null;
  onSelectState: (sigla: string) => void;
  maxCursos: number;
}

export function BrasilMap({ estadosData, selectedState, onSelectState, maxCursos }: BrasilMapProps) {
  const getHeatColor = (sigla: string, isDark: boolean) => {
    const estadoInfo = estadosData.get(sigla);
    if (!estadoInfo || estadoInfo.totalCursos === 0) {
      return isDark ? 'hsl(var(--muted))' : 'hsl(var(--muted))';
    }
    
    const intensity = estadoInfo.totalCursos / maxCursos;
    const opacity = 0.2 + intensity * 0.8;
    return `rgba(59, 130, 246, ${opacity})`;
  };

  const isDark = document.documentElement.classList.contains('dark');

  // Convert TopoJSON to GeoJSON
  const geoData = feature(
    brazilTopo as any,
    brazilTopo.objects.states as any
  );

  return (
    <div className="w-full h-full flex items-center justify-center">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 600,
          center: [-52, -15]
        }}
        className="w-full h-auto"
      >
        <Geographies geography={geoData}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const sigla = geo.properties.sigla as string;
              const isSelected = selectedState === sigla;
              const estadoInfo = estadosData.get(sigla);
              
              return (
                <Geography
                  key={sigla}
                  geography={geo}
                  fill={getHeatColor(sigla, isDark)}
                  stroke={isSelected ? '#1e40af' : 'hsl(var(--border))'}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  style={{
                    default: { outline: 'none' },
                    hover: {
                      fill: estadoInfo ? `rgba(59, 130, 246, 0.9)` : getHeatColor(sigla, isDark),
                      cursor: estadoInfo ? 'pointer' : 'default',
                      outline: 'none',
                      filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
                      transform: 'scale(1.02)',
                      transition: 'all 0.3s ease'
                    },
                    pressed: { outline: 'none' }
                  }}
                  onClick={() => estadoInfo && onSelectState(sigla)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && estadoInfo) {
                      onSelectState(sigla);
                    }
                  }}
                  aria-label={`${geo.properties.nome} - ${estadoInfo ? `${estadoInfo.totalCursos} cursos` : 'sem cursos'}`}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
}
