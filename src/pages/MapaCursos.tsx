import { useMemo, useState } from 'react';
import { useCursos } from '@/hooks/useCursos';
import { KPICard } from '@/components/common/KPICard';
import { EstadosGrid } from '@/components/mapa/EstadosGrid';
import { EstadoTopRanking } from '@/components/mapa/EstadoTopRanking';
import { ConcentracaoRegional } from '@/components/mapa/ConcentracaoRegional';
import { Map as MapIcon, MapPin } from 'lucide-react';
import { NOMES_ESTADOS, getRegiaoByEstado } from '@/data/estadosData';

export default function MapaCursos() {
  const { cursos, isLoading } = useCursos();
  const [selectedState, setSelectedState] = useState<string | null>(null);

  const estadosData = useMemo(() => {
    const dataMap = new Map<string, any>();
    cursos.forEach(curso => {
      const existing = dataMap.get(curso.estado) || {
        sigla: curso.estado,
        nome: NOMES_ESTADOS[curso.estado] || curso.estado,
        totalCursos: 0
      };
      dataMap.set(curso.estado, {
        ...existing,
        totalCursos: existing.totalCursos + 1
      });
    });
    return dataMap;
  }, [cursos]);

  const topEstados = useMemo(() => {
    return Array.from(estadosData.entries())
      .sort((a: any, b: any) => b[1].totalCursos - a[1].totalCursos)
      .slice(0, 5) as any;
  }, [estadosData]);

  const concentracao = useMemo(() => {
    const regioes: Record<string, number> = {};
    cursos.forEach(curso => {
      const regiao = getRegiaoByEstado(curso.estado);
      regioes[regiao] = (regioes[regiao] || 0) + 1;
    });
    
    return Object.entries(regioes).map(([nome, cursos]) => ({
      nome,
      cursos,
      percentual: cursos > 0 ? ((cursos / cursos) * 100).toFixed(1) : '0'
    }));
  }, [cursos]);

  const maxCursos = useMemo(() => {
    return Math.max(...Array.from(estadosData.values()).map((e: any) => e.totalCursos), 1);
  }, [estadosData]);

  const estadosAlcancados = estadosData.size;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Carregando mapa...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Mapa de Cursos</h1>
          <p className="text-muted-foreground">Distribuição geográfica dos cursos</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <KPICard
            title="Total de Cursos"
            value={cursos.length.toString()}
            icon={MapIcon}
            variant="accent"
          />
          <KPICard
            title="Estados Alcançados"
            value={estadosAlcancados.toString()}
            icon={MapPin}
            subtitle="De 27 estados"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <EstadosGrid
              estadosData={estadosData}
              selectedState={selectedState}
              onSelectState={setSelectedState}
              maxCursos={maxCursos}
            />
          </div>

          <div className="space-y-6">
            <EstadoTopRanking
              topEstados={topEstados}
              onSelectEstado={setSelectedState}
              selectedState={selectedState}
            />
            <ConcentracaoRegional concentracao={concentracao} />
          </div>
        </div>
      </div>
    </div>
  );
}
