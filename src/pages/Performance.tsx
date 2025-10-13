import { usePerformanceVendedoras } from '@/hooks/usePerformanceVendedoras';
import { KPICard } from '@/components/common/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, Users, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/utils/calculations';
import { Badge } from '@/components/ui/badge';

export default function Performance() {
  const { performance, isLoading } = usePerformanceVendedoras();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Carregando performance...</p>
      </div>
    );
  }

  const totalFaturamento = performance.reduce((sum, v) => sum + v.faturamento_total, 0);
  const taxaConversaoMedia = performance.length > 0
    ? performance.reduce((sum, v) => sum + v.taxa_conversao, 0) / performance.length
    : 0;
  const melhorVendedora = performance[0];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Performance de Vendedoras</h1>
          <p className="text-muted-foreground">Análise detalhada de resultados e metas</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <KPICard
            title="Faturamento Total"
            value={formatCurrency(totalFaturamento)}
            icon={DollarSign}
            variant="success"
          />
          <KPICard
            title="Taxa de Conversão Média"
            value={`${taxaConversaoMedia.toFixed(1)}%`}
            icon={TrendingUp}
            variant="accent"
          />
          <KPICard
            title="Melhor Vendedora"
            value={melhorVendedora?.nome || '-'}
            icon={Target}
            subtitle={melhorVendedora ? formatCurrency(melhorVendedora.faturamento_total) : ''}
          />
        </div>

        {/* Tabela de Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Ranking de Vendedoras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Vendedora</TableHead>
                  <TableHead className="text-right">Leads</TableHead>
                  <TableHead className="text-right">Convertidos</TableHead>
                  <TableHead className="text-right">Taxa Conv.</TableHead>
                  <TableHead className="text-right">Inscrições</TableHead>
                  <TableHead className="text-right">Faturamento</TableHead>
                  <TableHead className="text-right">Meta Anual</TableHead>
                  <TableHead>Progresso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {performance.map((vendedora, index) => {
                  const percentualMeta = vendedora.meta_anual > 0
                    ? (vendedora.faturamento_total / vendedora.meta_anual) * 100
                    : 0;

                  return (
                    <TableRow key={vendedora.id}>
                      <TableCell className="font-bold">{index + 1}º</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{vendedora.nome}</p>
                          <p className="text-xs text-muted-foreground">{vendedora.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{vendedora.total_leads}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{vendedora.leads_convertidos}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={vendedora.taxa_conversao >= 50 ? "default" : "outline"}>
                          {vendedora.taxa_conversao.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{vendedora.total_inscricoes}</TableCell>
                      <TableCell className="text-right font-bold text-primary">
                        {formatCurrency(vendedora.faturamento_total)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatCurrency(vendedora.meta_anual)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress value={Math.min(percentualMeta, 100)} className="h-2" />
                          <p className="text-xs text-muted-foreground text-right">
                            {percentualMeta.toFixed(0)}%
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {performance.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhuma vendedora cadastrada ainda</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
