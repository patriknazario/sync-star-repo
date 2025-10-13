import { useState } from 'react';
import { useCursos } from '@/hooks/useCursos';
import { useLeads } from '@/hooks/useLeads';
import { usePerformanceVendedoras } from '@/hooks/usePerformanceVendedoras';
import { useMetasGlobais } from '@/hooks/useMetasGlobais';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, Printer, Filter } from 'lucide-react';
import { formatCurrency } from '@/utils/calculations';
import { toast } from 'sonner';

type ReportType = 'vendas' | 'performance' | 'cursos' | 'metas';

export default function Relatorios() {
  const { cursos } = useCursos();
  const { leads } = useLeads();
  const { performance } = usePerformanceVendedoras();
  const { metasGlobais } = useMetasGlobais();
  const [selectedReport, setSelectedReport] = useState<ReportType>('vendas');

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast.error('Sem dados para exportar');
      return;
    }

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(key => `"${row[key] ?? ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Relatório exportado com sucesso!');
  };

  const handlePrint = () => {
    window.print();
    toast.success('Preparando impressão...');
  };

  const relatorioVendas = leads.filter(l => l.status === 'Inscrição Realizada').map(lead => ({
    Órgão: lead.orgao,
    Responsável: lead.nome_responsavel,
    Cidade: lead.cidade,
    Estado: lead.estado,
    Inscrições: lead.quantidade_inscricoes,
    Valor: formatCurrency(lead.valor_negociado ?? lead.valor_proposta),
    Data: lead.data_conversao
  }));

  const relatorioPerformance = performance.map(v => ({
    Vendedora: v.nome,
    'Total Leads': v.total_leads,
    Convertidos: v.leads_convertidos,
    'Taxa Conversão': `${v.taxa_conversao.toFixed(1)}%`,
    Inscrições: v.total_inscricoes,
    Faturamento: formatCurrency(v.faturamento_total),
    'Meta Anual': formatCurrency(v.meta_anual)
  }));

  const relatorioCursos = cursos.map(curso => ({
    Tema: curso.tema,
    Cidade: curso.cidade,
    Estado: curso.estado,
    'Data Início': curso.data_inicio,
    'Carga Horária': curso.carga_horaria,
    'Valor Inscrição': formatCurrency(curso.valor_inscricao),
    Status: curso.status
  }));

  const relatorioMetas = metasGlobais.map(meta => ({
    Ano: meta.ano,
    Meta: formatCurrency(meta.valor),
    Descrição: meta.descricao || '-'
  }));

  const reports = {
    vendas: { title: 'Relatório de Vendas', data: relatorioVendas },
    performance: { title: 'Relatório de Performance', data: relatorioPerformance },
    cursos: { title: 'Relatório de Cursos', data: relatorioCursos },
    metas: { title: 'Relatório de Metas', data: relatorioMetas }
  };

  const currentReport = reports[selectedReport];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Relatórios</h1>
          <p className="text-muted-foreground">Exportação e visualização de dados</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card
            className={`cursor-pointer transition-all ${selectedReport === 'vendas' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setSelectedReport('vendas')}
          >
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-bold">Vendas</h3>
              <p className="text-sm text-muted-foreground">{relatorioVendas.length} registros</p>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all ${selectedReport === 'performance' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setSelectedReport('performance')}
          >
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-accent" />
              <h3 className="font-bold">Performance</h3>
              <p className="text-sm text-muted-foreground">{relatorioPerformance.length} registros</p>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all ${selectedReport === 'cursos' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setSelectedReport('cursos')}
          >
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-success" />
              <h3 className="font-bold">Cursos</h3>
              <p className="text-sm text-muted-foreground">{relatorioCursos.length} registros</p>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all ${selectedReport === 'metas' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setSelectedReport('metas')}
          >
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-warning" />
              <h3 className="font-bold">Metas</h3>
              <p className="text-sm text-muted-foreground">{relatorioMetas.length} registros</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{currentReport.title}</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToCSV(currentReport.data, selectedReport)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {currentReport.data.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum dado disponível para este relatório</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(currentReport.data[0]).map(key => (
                        <TableHead key={key}>{key}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentReport.data.map((row, i) => (
                      <TableRow key={i}>
                        {Object.values(row).map((value, j) => (
                          <TableCell key={j}>{value as string}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
