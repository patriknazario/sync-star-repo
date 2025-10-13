import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useCursos } from '@/hooks/useCursos';
import { useLeads } from '@/hooks/useLeads';
import { useProfessores } from '@/hooks/useProfessores';
import { useMetasGlobais } from '@/hooks/useMetasGlobais';
import { KPICard } from '@/components/common/KPICard';
import { ProgressBar } from '@/components/common/ProgressBar';
import { CursoCard } from '@/components/dashboard/CursoCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, TrendingUp, Users, DollarSign } from 'lucide-react';
import { calculateTotalFaturamento, calculateTotalInscricoes, formatCurrency } from '@/utils/calculations';

export default function Dashboard() {
  const { anoSelecionado } = useApp();
  const { cursos, isLoading: cursosLoading } = useCursos();
  const { leads, isLoading: leadsLoading } = useLeads();
  const { professores, isLoading: professoresLoading } = useProfessores();
  const { metasGlobais, isLoading: metasLoading } = useMetasGlobais();
  const navigate = useNavigate();

  const metaGlobal = metasGlobais.find(m => m.ano === anoSelecionado);
  const metaAtual = metaGlobal?.valor ?? 0;

  const cursosAtivos = cursos
    .filter(c => c.status === 'Inscrições Abertas' || c.status === 'Em Andamento')
    .sort((a, b) => new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime());

  const totalFaturamento = calculateTotalFaturamento(leads);
  const totalInscricoes = calculateTotalInscricoes(leads);

  const handleAddLead = (cursoId: string) => {
    navigate(`/crm?curso=${cursoId}`);
  };

  const handleEditCurso = (cursoId: string) => {
    navigate('/cursos');
  };

  if (cursosLoading || leadsLoading || professoresLoading || metasLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard Comercial</h1>
          <p className="text-muted-foreground">Visão geral das atividades e performance</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Cursos Ativos"
            value={cursosAtivos.length.toString()}
            icon={Target}
            subtitle={`De ${cursos.length} cursos totais`}
          />
          <KPICard
            title="Total de Cursos"
            value={cursos.length.toString()}
            icon={TrendingUp}
            subtitle="Todos os cursos cadastrados"
          />
          <KPICard
            title="Inscrições"
            value={totalInscricoes.toString()}
            icon={Users}
            subtitle="Inscrições confirmadas"
          />
          <KPICard
            title="Faturamento"
            value={formatCurrency(totalFaturamento)}
            icon={DollarSign}
            subtitle="Faturamento realizado"
          />
        </div>

        {/* Meta Anual */}
        <div className="mb-12">
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Meta Anual {anoSelecionado}
            </h2>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">Realizado</span>
                <span className="text-2xl font-bold text-accent">{formatCurrency(totalFaturamento)}</span>
              </div>
              <ProgressBar current={totalFaturamento} target={metaAtual} />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-muted-foreground">Meta: {formatCurrency(metaAtual)}</span>
                <span className="text-sm text-muted-foreground">
                  {metaAtual > 0 ? Math.round((totalFaturamento / metaAtual) * 100) : 0}%
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Cursos Ativos */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Cursos Ativos</h2>
            <Button onClick={() => navigate('/cursos')} className="bg-accent hover:bg-accent/90">
              Ver Todos os Cursos
            </Button>
          </div>

          {cursosAtivos.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-lg text-muted-foreground mb-4">
                Nenhum curso ativo no momento
              </p>
              <Button onClick={() => navigate('/cursos')}>
                Criar Curso
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cursosAtivos.map((curso) => (
                <CursoCard
                  key={curso.id}
                  curso={curso}
                  professorNome={curso.professor?.nome}
                  onAddLead={handleAddLead}
                  onEdit={handleEditCurso}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
