import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { feature } from 'topojson-client';
import brazilTopo from '@/data/brazil-states.json';
import { useMemo, useState } from 'react';

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
  const [tooltipContent, setTooltipContent] = useState('');
  
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

  // Convert TopoJSON to GeoJSON (memoized for performance)
  const geoData = useMemo(() => 
    feature(
      brazilTopo as any,
      brazilTopo.objects.states as any
    ), []
  );

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      {tooltipContent && (
        <div className="absolute top-4 left-4 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-lg z-10 whitespace-pre-line">
          {tooltipContent}
        </div>
      )}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 700,
          center: [-53, -14]
        }}
        width={800}
        height={600}
        className="w-full h-auto"
      >
        <Geographies geography={geoData}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const sigla = (geo.properties.sigla || geo.properties.abbreviation || geo.id) as string;
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
                  onMouseEnter={() => {
                    const info = estadosData.get(sigla);
                    setTooltipContent(info 
                      ? `${geo.properties.nome || geo.properties.name}\n${info.totalCursos} curso${info.totalCursos !== 1 ? 's' : ''}`
                      : (geo.properties.nome || geo.properties.name || sigla)
                    );
                  }}
                  onMouseLeave={() => setTooltipContent('')}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && estadoInfo) {
                      onSelectState(sigla);
                    }
                  }}
                  aria-label={`${geo.properties.nome || geo.properties.name} - ${estadoInfo ? `${estadoInfo.totalCursos} cursos` : 'sem cursos'}`}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
}
