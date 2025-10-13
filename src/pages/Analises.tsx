import { useMemo } from 'react';
import { useCursos } from '@/hooks/useCursos';
import { useLeads } from '@/hooks/useLeads';
import { useMetasGlobais } from '@/hooks/useMetasGlobais';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, PieChart as PieIcon, BarChart3, Activity } from 'lucide-react';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];
const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function Analises() {
  const { anoSelecionado } = useApp();
  const { cursos, isLoading: cursosLoading } = useCursos();
  const { leads, isLoading: leadsLoading } = useLeads();
  const { metasGlobais } = useMetasGlobais();

  const faturamentoPorMes = useMemo(() => {
    const porMes: Record<number, number> = {};
    leads
      .filter(l => l.status === 'Inscrição Realizada' && l.data_conversao)
      .forEach(lead => {
        const mes = new Date(lead.data_conversao!).getMonth();
        porMes[mes] = (porMes[mes] || 0) + (lead.valor_negociado ?? lead.valor_proposta);
      });

    return MESES.map((mes, i) => ({
      mes,
      faturamento: porMes[i] || 0
    }));
  }, [leads]);

  const leadsPorStatus = useMemo(() => {
    const statusCount: Record<string, number> = {};
    leads.forEach(lead => {
      statusCount[lead.status] = (statusCount[lead.status] || 0) + 1;
    });
    return Object.entries(statusCount).map(([status, count]) => ({
      status,
      count
    }));
  }, [leads]);

  const cursosPorEstado = useMemo(() => {
    const porEstado: Record<string, number> = {};
    cursos.forEach(curso => {
      porEstado[curso.estado] = (porEstado[curso.estado] || 0) + 1;
    });
    return Object.entries(porEstado)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([estado, count]) => ({
        estado,
        count
      }));
  }, [cursos]);

  const evolucaoInscricoes = useMemo(() => {
    const porMes: Record<number, number> = {};
    leads
      .filter(l => l.status === 'Inscrição Realizada' && l.data_conversao)
      .forEach(lead => {
        const mes = new Date(lead.data_conversao!).getMonth();
        porMes[mes] = (porMes[mes] || 0) + lead.quantidade_inscricoes;
      });

    return MESES.map((mes, i) => ({
      mes,
      inscricoes: porMes[i] || 0
    }));
  }, [leads]);

  if (cursosLoading || leadsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Carregando análises...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Análises</h1>
          <p className="text-muted-foreground">Insights e tendências do negócio</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Faturamento Mensal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Faturamento Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={faturamentoPorMes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="faturamento" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Leads por Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Leads por Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={leadsPorStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="hsl(var(--accent))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cursos por Estado (Top 10) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieIcon className="h-5 w-5" />
                Distribuição por Estado (Top 10)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={cursosPorEstado}
                    dataKey="count"
                    nameKey="estado"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {cursosPorEstado.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Evolução de Inscrições */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Evolução de Inscrições
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={evolucaoInscricoes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="inscricoes" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
