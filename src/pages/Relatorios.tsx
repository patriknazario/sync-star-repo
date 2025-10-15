import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  exportPerformanceVendas,
  exportAnaliseRegiao,
  exportAnaliseCurso,
  exportComissoes,
  exportPipeline,
} from '@/utils/exportService';
import { CursoCalendar } from '@/components/relatorios/CursoCalendar';

export default function Relatorios() {
  const { cursos, leads, getInscricoesCurso, vendedoras, professores } = useApp();
  const [loading, setLoading] = useState(false);

  const handleExport = async (tipo: string, exportFn: () => void) => {
    setLoading(true);
    try {
      await exportFn();
      toast.success(`Relatório de ${tipo} exportado com sucesso!`, {
        description: 'O download foi iniciado',
      });
    } catch (error) {
      toast.error(`Erro ao exportar relatório de ${tipo}`, {
        description: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportGoogleCalendar = () => {
    toast.info('Funcionalidade de exportação para Google Calendar em desenvolvimento', {
      description: 'Em breve você poderá adicionar cursos ao seu calendário',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground mt-2">Exporte dados e visualize o calendário de cursos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Exportação de Relatórios */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Exportar Relatórios</h2>
            <div className="space-y-3">
              <Button
                onClick={() =>
                  handleExport('Performance de Vendas', () =>
                    exportPerformanceVendas(vendedoras, leads, cursos)
                  )
                }
                variant="outline"
                className="w-full justify-start"
                disabled={loading}
              >
                <FileDown className="h-4 w-4 mr-2" />
                Performance de Vendas
              </Button>

              <Button
                onClick={() =>
                  handleExport('Análise por Região', () => exportAnaliseRegiao(cursos, leads))
                }
                variant="outline"
                className="w-full justify-start"
                disabled={loading}
              >
                <FileDown className="h-4 w-4 mr-2" />
                Análise por Região
              </Button>

              <Button
                onClick={() =>
                  handleExport('Análise por Curso', () => exportAnaliseCurso(cursos, leads))
                }
                variant="outline"
                className="w-full justify-start"
                disabled={loading}
              >
                <FileDown className="h-4 w-4 mr-2" />
                Análise por Curso
              </Button>

              <Button
                onClick={() =>
                  handleExport('Comissões', () => exportComissoes(vendedoras, leads, cursos))
                }
                variant="outline"
                className="w-full justify-start"
                disabled={loading}
              >
                <FileDown className="h-4 w-4 mr-2" />
                Relatório de Comissões
              </Button>

              <Button
                onClick={() =>
                  handleExport('Pipeline de Receita', () => exportPipeline(leads, cursos, vendedoras))
                }
                variant="outline"
                className="w-full justify-start"
                disabled={loading}
              >
                <FileDown className="h-4 w-4 mr-2" />
                Pipeline de Receita
              </Button>
            </div>
          </Card>

          {/* Calendário */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Calendário de Cursos</h2>
              <Button onClick={handleExportGoogleCalendar} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar para Google Calendar
              </Button>
            </div>
            <CursoCalendar cursos={cursos} />
          </Card>
        </div>

        {/* Lista de Cursos Agendados */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Próximos Cursos</h2>
          <div className="space-y-3">
            {cursos
              .filter(c => c.status !== 'Cancelado' && c.status !== 'Concluído')
              .sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime())
              .map((curso) => {
                const dataInicio = new Date(curso.dataInicio);
                const dataFormatada = dataInicio.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                });

                return (
                  <div
                    key={curso.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <h3 className="font-semibold">{curso.tema}</h3>
                      <p className="text-sm text-muted-foreground">
                        {curso.cidade}, {curso.estado} • {dataFormatada}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-accent">{getInscricoesCurso(curso.id)} inscrições</p>
                      <p className="text-xs text-muted-foreground">{curso.status}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      </div>
    </div>
  );
}
