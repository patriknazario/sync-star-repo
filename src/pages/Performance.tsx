import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { KPICard } from '@/components/common/KPICard';
import { ProgressBar } from '@/components/common/ProgressBar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trophy, TrendingUp, DollarSign, Users, Edit2, Check } from 'lucide-react';
import {
  calculateFaturamentoByVendedora,
  calculateInscricoesByVendedora,
  calculateComissao,
  calculateTotalFaturamento,
  calculateTotalInscricoes,
  formatCurrency,
} from '@/utils/calculations';
import { Vendedora } from '@/data/mockData';

export default function Performance() {
  const { leads, vendedoras, updateVendedoraMeta } = useApp();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState({ metaMensal: 0, metaAnual: 0 });

  const totalFaturamento = calculateTotalFaturamento(leads);
  const totalInscricoes = calculateTotalInscricoes(leads);
  const metaTotal = vendedoras.reduce((sum, v) => sum + v.metaAnual, 0);

  const vendedorasComPerformance = vendedoras.map(vendedora => {
    const faturamento = calculateFaturamentoByVendedora(leads, vendedora.id);
    const inscricoes = calculateInscricoesByVendedora(leads, vendedora.id);
    const comissao = calculateComissao(faturamento);
    const atingimento = vendedora.metaAnual > 0 ? (faturamento / vendedora.metaAnual) * 100 : 0;

    return {
      ...vendedora,
      faturamento,
      inscricoes,
      comissao,
      atingimento,
    };
  }).sort((a, b) => b.faturamento - a.faturamento);

  const handleEdit = (vendedora: Vendedora) => {
    setEditingId(vendedora.id);
    setEditValues({
      metaMensal: vendedora.metaMensal,
      metaAnual: vendedora.metaAnual,
    });
  };

  const handleSave = (id: number) => {
    updateVendedoraMeta(id, editValues.metaMensal, editValues.metaAnual);
    setEditingId(null);
  };

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 0:
        return '🥇';
      case 1:
        return '🥈';
      case 2:
        return '🥉';
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Performance de Vendas</h1>
          <p className="text-muted-foreground mt-2">Acompanhe o desempenho individual e do time</p>
        </div>

        {/* KPIs Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Inscrições do Time"
            value={totalInscricoes}
            icon={Users}
            variant="success"
          />
          
          <KPICard
            title="Faturamento Total"
            value={formatCurrency(totalFaturamento)}
            icon={DollarSign}
            variant="accent"
          />
          
          <KPICard
            title="Meta Total"
            value={formatCurrency(metaTotal)}
            icon={TrendingUp}
            variant="default"
          />
          
          <KPICard
            title="Atingimento"
            value={`${((totalFaturamento / metaTotal) * 100).toFixed(1)}%`}
            icon={Trophy}
            variant="default"
          />
        </div>

        {/* Meta Total do Time */}
        <Card className="p-6 mb-8 bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20">
          <h2 className="text-xl font-bold text-foreground mb-4">Progressão da Meta Total do Time</h2>
          <ProgressBar
            current={totalFaturamento}
            target={metaTotal}
            gradient={true}
          />
        </Card>

        {/* Ranking */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
            <Trophy className="h-6 w-6 mr-2 text-accent" />
            Ranking Top Sellers
          </h2>

          <div className="space-y-4">
            {vendedorasComPerformance.map((vendedora, index) => {
              const isEditing = editingId === vendedora.id;
              const medal = getMedalIcon(index);
              const isTop3 = index < 3;

              return (
                <Card
                  key={vendedora.id}
                  className={`p-6 transition-all ${
                    isTop3
                      ? 'bg-gradient-to-r from-primary/5 to-accent/5 border-2 border-accent/30 shadow-elegant'
                      : 'hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Posição */}
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                        {medal || `${index + 1}º`}
                      </div>

                      {/* Nome */}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-foreground">{vendedora.nome}</h3>
                      </div>

                      {/* Métricas */}
                      <div className="hidden md:grid grid-cols-5 gap-6 flex-1">
                        <div>
                          <p className="text-xs text-muted-foreground">Inscrições</p>
                          <p className="text-lg font-semibold">{vendedora.inscricoes}</p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">Faturamento</p>
                          <p className="text-lg font-semibold text-accent">
                            {formatCurrency(vendedora.faturamento)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">Meta</p>
                          {isEditing ? (
                            <Input
                              type="number"
                              value={editValues.metaAnual}
                              onChange={(e) => setEditValues({ ...editValues, metaAnual: Number(e.target.value) })}
                              className="h-8 text-sm"
                            />
                          ) : (
                            <p className="text-lg font-semibold">{formatCurrency(vendedora.metaAnual)}</p>
                          )}
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">Atingimento</p>
                          <div className="w-32">
                            <ProgressBar
                              current={vendedora.faturamento}
                              target={vendedora.metaAnual}
                              showPercentage={true}
                            />
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">Comissão (5%)</p>
                          <p className="text-lg font-semibold text-success">
                            {formatCurrency(vendedora.comissao)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Botão Editar */}
                    <div className="ml-4">
                      {isEditing ? (
                        <Button
                          onClick={() => handleSave(vendedora.id)}
                          size="sm"
                          className="bg-success hover:bg-success/90"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleEdit(vendedora)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Mobile View */}
                  <div className="md:hidden mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Inscrições</p>
                      <p className="font-semibold">{vendedora.inscricoes}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Faturamento</p>
                      <p className="font-semibold text-accent">{formatCurrency(vendedora.faturamento)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Meta</p>
                      <p className="font-semibold">{formatCurrency(vendedora.metaAnual)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Comissão</p>
                      <p className="font-semibold text-success">{formatCurrency(vendedora.comissao)}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
