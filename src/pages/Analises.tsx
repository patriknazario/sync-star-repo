import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  calculateTaxaConversao,
  calculateCicloVendas,
  formatCurrency,
} from '@/utils/calculations';
import { Lead } from '@/data/mockData';

export default function Analises() {
  const { leads, cursos, vendedoras } = useApp();

  // Performance por Estado
  const faturamentoPorEstado = cursos.reduce((acc, curso) => {
    const leadsDoCurso = leads.filter(l => l.cursoId === curso.id && l.status === 'Inscrição Realizada');
    const faturamento = leadsDoCurso.reduce((sum, l) => sum + l.valorProposta, 0);
    
    if (!acc[curso.estado]) {
      acc[curso.estado] = { estado: curso.estado, faturamento: 0, inscricoes: 0 };
    }
    acc[curso.estado].faturamento += faturamento;
    acc[curso.estado].inscricoes += leadsDoCurso.reduce((sum, l) => sum + l.quantidadeInscricoes, 0);
    
    return acc;
  }, {} as Record<string, { estado: string; faturamento: number; inscricoes: number }>);

  const dadosEstados = Object.values(faturamentoPorEstado).sort((a, b) => b.faturamento - a.faturamento);

  // Performance por Tema
  const faturamentoPorTema = cursos.reduce((acc, curso) => {
    const leadsDoCurso = leads.filter(l => l.cursoId === curso.id && l.status === 'Inscrição Realizada');
    const inscricoes = leadsDoCurso.reduce((sum, l) => sum + l.quantidadeInscricoes, 0);
    
    if (!acc[curso.tema]) {
      acc[curso.tema] = { tema: curso.tema, inscricoes: 0 };
    }
    acc[curso.tema].inscricoes += inscricoes;
    
    return acc;
  }, {} as Record<string, { tema: string; inscricoes: number }>);

  const dadosTemas = Object.values(faturamentoPorTema)
    .sort((a, b) => b.inscricoes - a.inscricoes)
    .slice(0, 5);

  // Ciclo de Vendas
  const cicloMedio = calculateCicloVendas(leads);

  // Sazonalidade (inscrições por mês)
  const inscricoesPorMes = leads
    .filter(l => l.status === 'Inscrição Realizada' && l.dataConversao)
    .reduce((acc, lead) => {
      const mes = new Date(lead.dataConversao!).toLocaleString('pt-BR', { month: 'short' });
      if (!acc[mes]) {
        acc[mes] = { mes, inscricoes: 0 };
      }
      acc[mes].inscricoes += lead.quantidadeInscricoes;
      return acc;
    }, {} as Record<string, { mes: string; inscricoes: number }>);

  const dadosSazonalidade = Object.values(inscricoesPorMes);

  // Motivos de Perda
  const motivosPerda = leads
    .filter(l => l.status === 'Proposta Declinada' && l.motivoPerda)
    .reduce((acc, lead) => {
      const motivo = lead.motivoPerda!;
      if (!acc[motivo]) {
        acc[motivo] = { motivo, quantidade: 0 };
      }
      acc[motivo].quantidade += 1;
      return acc;
    }, {} as Record<string, { motivo: string; quantidade: number }>);

  const dadosMotivos = Object.values(motivosPerda);

  // Taxa de Conversão
  const taxaConversao = calculateTaxaConversao(leads);
  const totalPropostas = leads.length;
  const totalConvertidas = leads.filter(l => l.status === 'Inscrição Realizada').length;
  const totalDeclinadas = leads.filter(l => l.status === 'Proposta Declinada').length;

  const COLORS = ['hsl(var(--accent))', 'hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Análise e Inteligência Comercial</h1>
          <p className="text-muted-foreground mt-2">Insights estratégicos para tomada de decisão</p>
        </div>

        {/* Grid de Análises */}
        <div className="space-y-8">
          {/* Performance por Região */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Performance por Estado</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosEstados}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="estado" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="faturamento" fill="hsl(var(--accent))" name="Faturamento" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Performance por Tema */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Top 5 Cursos Mais Vendidos</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosTemas} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="tema" type="category" width={200} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="inscricoes" fill="hsl(var(--primary))" name="Inscrições" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Ciclo de Vendas e Taxa de Conversão */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Ciclo de Vendas Médio</h2>
              <div className="text-center py-8">
                <div className="text-6xl font-bold text-accent mb-2">
                  {cicloMedio.toFixed(1)}
                </div>
                <p className="text-muted-foreground">dias entre proposta e conversão</p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Taxa de Conversão Geral</h2>
              <div className="text-center py-8">
                <div className="text-6xl font-bold text-success mb-2">
                  {taxaConversao.toFixed(1)}%
                </div>
                <p className="text-muted-foreground">
                  {totalConvertidas} de {totalPropostas} propostas convertidas
                </p>
              </div>
            </Card>
          </div>

          {/* Sazonalidade */}
          {dadosSazonalidade.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Sazonalidade - Inscrições por Mês</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dadosSazonalidade}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line type="monotone" dataKey="inscricoes" stroke="hsl(var(--primary))" strokeWidth={2} name="Inscrições" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Motivos de Perda */}
          {dadosMotivos.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Análise de Motivos de Perda</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dadosMotivos}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ motivo, percent }) => `${motivo}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="quantidade"
                    >
                      {dadosMotivos.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="flex flex-col justify-center space-y-4">
                  {dadosMotivos.map((item, index) => {
                    const total = dadosMotivos.reduce((sum, m) => sum + m.quantidade, 0);
                    const percentual = (item.quantidade / total) * 100;
                    
                    return (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{item.motivo}</span>
                          <span className="text-sm text-muted-foreground">
                            {item.quantidade} ({percentual.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${percentual}%`,
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}

          {/* Funil de Conversão */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-6">Funil de Conversão</h2>
            <div className="space-y-4">
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Propostas Enviadas</span>
                  <span className="text-muted-foreground">{totalPropostas}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-12 flex items-center px-4">
                  <div className="text-sm font-medium">100%</div>
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Inscrições Realizadas</span>
                  <span className="text-muted-foreground">{totalConvertidas}</span>
                </div>
                <div
                  className="bg-success rounded-full h-12 flex items-center px-4 transition-all"
                  style={{ width: `${(totalConvertidas / totalPropostas) * 100}%` }}
                >
                  <div className="text-sm font-medium text-success-foreground">
                    {((totalConvertidas / totalPropostas) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Propostas Declinadas</span>
                  <span className="text-muted-foreground">{totalDeclinadas}</span>
                </div>
                <div
                  className="bg-destructive rounded-full h-12 flex items-center px-4 transition-all"
                  style={{ width: `${(totalDeclinadas / totalPropostas) * 100}%` }}
                >
                  <div className="text-sm font-medium text-destructive-foreground">
                    {((totalDeclinadas / totalPropostas) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
