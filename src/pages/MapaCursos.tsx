import { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, DollarSign, TrendingUp, MapPin, Search } from 'lucide-react';
import { EstadosGrid } from '@/components/mapa/EstadosGrid';
import { EstadoModal } from '@/components/mapa/EstadoModal';
import { EstadoTopRanking } from '@/components/mapa/EstadoTopRanking';
import { ConcentracaoRegional } from '@/components/mapa/ConcentracaoRegional';
import { REGIOES, NOMES_ESTADOS } from '@/data/estadosData';
import { getInscricoesCurso, formatCurrency } from '@/utils/calculations';
import { useDebounce } from 'use-debounce';
import { Vendedora } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

interface EstadoInfo {
  sigla: string;
  nome: string;
  cursos: any[];
  totalCursos: number;
  totalInscricoes: number;
  receitaPrevista: number;
  cidades: string[];
  vendedoraResponsavel?: Vendedora;
}

export default function MapaCursos() {
  const { cursos, leads, vendedoras, professores } = useApp();
  const { toast } = useToast();
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroRegiao, setFiltroRegiao] = useState('todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [debouncedSearch] = useDebounce(searchTerm, 300);

  // Estado responsáveis (localStorage)
  const [estadoResponsaveis, setEstadoResponsaveis] = useState<Map<string, number>>(() => {
    const stored = localStorage.getItem('cgp-estado-responsaveis');
    return stored ? new Map(JSON.parse(stored)) : new Map();
  });

  useEffect(() => {
    localStorage.setItem('cgp-estado-responsaveis', 
      JSON.stringify(Array.from(estadoResponsaveis.entries()))
    );
  }, [estadoResponsaveis]);

  // Cursos de 2025
  const cursos2025 = useMemo(() => 
    cursos.filter(c => c.dataInicio.startsWith('2025')),
    [cursos]
  );

  // Mapa de inscrições por curso
  const inscricoesPorCurso = useMemo(() => {
    const map = new Map<number, number>();
    cursos2025.forEach(curso => {
      map.set(curso.id, getInscricoesCurso(leads, curso.id));
    });
    return map;
  }, [cursos2025, leads]);

  // Estados com dados
  const estadosData = useMemo(() => {
    const map = new Map<string, EstadoInfo>();
    
    cursos2025.forEach(curso => {
      const sigla = curso.estado;
      if (!map.has(sigla)) {
        map.set(sigla, {
          sigla,
          nome: NOMES_ESTADOS[sigla] || sigla,
          cursos: [],
          totalCursos: 0,
          totalInscricoes: 0,
          receitaPrevista: 0,
          cidades: [],
          vendedoraResponsavel: undefined
        });
      }
      
      const estado = map.get(sigla)!;
      estado.cursos.push(curso);
      estado.totalCursos++;
      
      if (!estado.cidades.includes(curso.cidade)) {
        estado.cidades.push(curso.cidade);
      }
      
      const inscricoes = inscricoesPorCurso.get(curso.id) || 0;
      estado.totalInscricoes += inscricoes;
      estado.receitaPrevista += curso.valorInscricao * inscricoes;
    });

    // Adicionar vendedoras responsáveis
    estadoResponsaveis.forEach((vendedoraId, sigla) => {
      const estado = map.get(sigla);
      if (estado) {
        estado.vendedoraResponsavel = vendedoras.find(v => v.id === vendedoraId);
      }
    });
    
    return map;
  }, [cursos2025, inscricoesPorCurso, estadoResponsaveis, vendedoras]);

  // Filtrar por região e busca
  const estadosFiltrados = useMemo(() => {
    let filtered = Array.from(estadosData.entries());

    // Filtro de região
    if (filtroRegiao !== 'todas') {
      const estadosDaRegiao = REGIOES[filtroRegiao] || [];
      filtered = filtered.filter(([sigla]) => estadosDaRegiao.includes(sigla));
    }

    // Filtro de busca
    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      filtered = filtered.filter(([sigla, estado]) => 
        sigla.toLowerCase().includes(term) || 
        estado.nome.toLowerCase().includes(term)
      );
    }

    return new Map(filtered);
  }, [estadosData, filtroRegiao, debouncedSearch]);

  // Métricas globais
  const metricas = useMemo(() => {
    const totalCursos = cursos2025.length;
    const estadosAtendidos = new Set(cursos2025.map(c => c.estado)).size;
    const receitaTotal = Array.from(estadosData.values()).reduce(
      (sum, e) => sum + e.receitaPrevista, 0
    );
    const crescimento = '+5.0'; // Placeholder - pode ser calculado dinamicamente

    return { totalCursos, estadosAtendidos, receitaTotal, crescimento };
  }, [cursos2025, estadosData]);

  // Ranking Top 5
  const topEstados = useMemo(() => 
    Array.from(estadosData.entries())
      .sort((a, b) => b[1].totalCursos - a[1].totalCursos)
      .slice(0, 5),
    [estadosData]
  );

  // Concentração Regional
  const concentracaoPorRegiao = useMemo(() => {
    const regioes = Object.keys(REGIOES).map(regiao => ({
      nome: regiao,
      cursos: cursos2025.filter(c => REGIOES[regiao].includes(c.estado)).length
    }));
    
    const total = cursos2025.length;
    return regioes.map(r => ({
      ...r,
      percentual: total > 0 ? ((r.cursos / total) * 100).toFixed(1) : '0'
    }));
  }, [cursos2025]);

  // Max cursos para escala de calor
  const maxCursos = useMemo(() => 
    Math.max(...Array.from(estadosData.values()).map(e => e.totalCursos), 1),
    [estadosData]
  );

  const handleSelectState = (sigla: string) => {
    setSelectedState(sigla);
    setIsModalOpen(true);
  };

  const handleUpdateResponsavel = (estadoSigla: string, vendedoraId: number) => {
    setEstadoResponsaveis(prev => {
      const newMap = new Map(prev);
      newMap.set(estadoSigla, vendedoraId);
      return newMap;
    });
    
    const vendedora = vendedoras.find(v => v.id === vendedoraId);
    toast({
      title: "Responsável atualizado",
      description: `${vendedora?.nome} agora é responsável por ${NOMES_ESTADOS[estadoSigla]}`
    });
  };

  const estadoSelecionado = selectedState ? estadosData.get(selectedState) : null;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Mapa de Cursos 2025</h1>
          <p className="text-muted-foreground">Distribuição geográfica dos cursos programados</p>
        </div>

        {/* Filtros */}
        <Card className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar estado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filtroRegiao} onValueChange={setFiltroRegiao}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Região" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Regiões</SelectItem>
                {Object.keys(REGIOES).map(regiao => (
                  <SelectItem key={regiao} value={regiao}>{regiao}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">Total de Cursos</p>
            </div>
            <p className="text-3xl font-bold">{metricas.totalCursos}</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-5 w-5 text-success" />
              <p className="text-sm text-muted-foreground">Receita Prevista</p>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(metricas.receitaTotal)}</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-5 w-5 text-accent" />
              <p className="text-sm text-muted-foreground">Crescimento</p>
            </div>
            <p className="text-3xl font-bold text-green-600">{metricas.crescimento}%</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">Estados Atendidos</p>
            </div>
            <p className="text-3xl font-bold">{metricas.estadosAtendidos}</p>
          </Card>
        </div>

        {/* Layout Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Grid de Estados (70%) */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6">
              <EstadosGrid
                estadosData={estadosFiltrados}
                selectedState={selectedState}
                onSelectState={handleSelectState}
                maxCursos={maxCursos}
              />
              
              {/* Legenda */}
              <div className="flex items-center justify-center gap-4 mt-6 text-sm">
                <span className="text-muted-foreground">Escala de calor:</span>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-primary/20" />
                  <span>Poucos cursos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-primary" />
                  <span>Muitos cursos</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar (30%) */}
          <div className="space-y-4">
            <EstadoTopRanking 
              topEstados={topEstados}
              onSelectEstado={handleSelectState}
              selectedState={selectedState}
            />
            
            <ConcentracaoRegional concentracao={concentracaoPorRegiao} />
          </div>
        </div>

        {/* Modal de Detalhes */}
        <EstadoModal
          estado={estadoSelecionado}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedState(null);
          }}
          vendedoras={vendedoras}
          professores={professores}
          onUpdateResponsavel={handleUpdateResponsavel}
          inscricoesPorCurso={inscricoesPorCurso}
        />
      </div>
    </div>
  );
}
