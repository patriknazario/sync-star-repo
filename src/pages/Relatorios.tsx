import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function Relatorios() {
  const { cursos, leads } = useApp();

  const handleExportRelatorio = (tipo: string) => {
    toast.success(`Relatório de ${tipo} gerado com sucesso!`, {
      description: 'O download começará em instantes',
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
                onClick={() => handleExportRelatorio('Performance de Vendas')}
                variant="outline"
                className="w-full justify-start"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Performance de Vendas
              </Button>

              <Button
                onClick={() => handleExportRelatorio('Análise por Região')}
                variant="outline"
                className="w-full justify-start"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Análise por Região
              </Button>

              <Button
                onClick={() => handleExportRelatorio('Análise por Curso')}
                variant="outline"
                className="w-full justify-start"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Análise por Curso
              </Button>

              <Button
                onClick={() => handleExportRelatorio('Comissões')}
                variant="outline"
                className="w-full justify-start"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Relatório de Comissões
              </Button>

              <Button
                onClick={() => handleExportRelatorio('Pipeline')}
                variant="outline"
                className="w-full justify-start"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Pipeline de Receita
              </Button>
            </div>
          </Card>

          {/* Calendário */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Calendário de Cursos</h2>
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <CalendarIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  Visualização de calendário em desenvolvimento
                </p>
                <Button
                  onClick={() => toast.info('Funcionalidade em desenvolvimento')}
                  variant="outline"
                >
                  Exportar para Google Calendar
                </Button>
              </div>
            </div>
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
                      <p className="text-sm font-medium text-accent">{curso.inscricoes} inscrições</p>
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
