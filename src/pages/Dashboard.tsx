import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { KPICard } from '@/components/common/KPICard';
import { ProgressBar } from '@/components/common/ProgressBar';
import { CursoCard } from '@/components/dashboard/CursoCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, DollarSign, Users, TrendingUp, Edit2, Check } from 'lucide-react';
import {
  calculateTotalFaturamento,
  calculateTotalInscricoes,
  formatCurrency,
} from '@/utils/calculations';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { cursos, leads, professores, metaTotalAnual, setMetaTotalAnual } = useApp();
  const navigate = useNavigate();
  const [editingMeta, setEditingMeta] = useState(false);
  const [newMeta, setNewMeta] = useState(metaTotalAnual);

  const cursosAtivos = cursos.filter(c => 
    c.status === 'Inscrições Abertas' || c.status === 'Em Andamento'
  );

  const totalFaturamento = calculateTotalFaturamento(leads);
  const totalInscricoes = calculateTotalInscricoes(leads);

  const handleSaveMeta = () => {
    setMetaTotalAnual(newMeta);
    setEditingMeta(false);
  };

  const handleAddLead = (cursoId: number) => {
    navigate(`/crm?curso=${cursoId}`);
  };

  const handleEditCurso = (cursoId: number) => {
    navigate(`/cursos?edit=${cursoId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard Comercial</h1>
          <p className="text-muted-foreground mt-2">Visão geral do desempenho da CGP</p>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Cursos Ativos"
            value={cursosAtivos.length}
            icon={BookOpen}
            variant="default"
          />
          
          <KPICard
            title="Total de Cursos"
            value={cursos.length}
            icon={BookOpen}
            variant="default"
          />
          
          <KPICard
            title="Inscrições Realizadas"
            value={totalInscricoes}
            icon={Users}
            subtitle="Total no mês atual"
            variant="success"
          />
          
          <KPICard
            title="Faturamento Atual"
            value={formatCurrency(totalFaturamento)}
            icon={DollarSign}
            variant="accent"
          />
        </div>

        {/* Meta Anual */}
        <Card className="p-6 mb-8 bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Meta de Faturamento Anual</h2>
            {editingMeta ? (
              <Button
                onClick={handleSaveMeta}
                size="sm"
                className="bg-success hover:bg-success/90"
              >
                <Check className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            ) : (
              <Button
                onClick={() => setEditingMeta(true)}
                variant="outline"
                size="sm"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Editar Meta
              </Button>
            )}
          </div>

          {editingMeta ? (
            <div className="mb-4">
              <Input
                type="number"
                value={newMeta}
                onChange={(e) => setNewMeta(Number(e.target.value))}
                className="text-lg font-semibold"
              />
            </div>
          ) : (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-1">Meta: {formatCurrency(metaTotalAnual)}</p>
              <p className="text-2xl font-bold text-foreground">Realizado: {formatCurrency(totalFaturamento)}</p>
            </div>
          )}

          <ProgressBar
            current={totalFaturamento}
            target={metaTotalAnual}
            gradient={true}
          />
        </Card>

        {/* Cursos Ativos */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Cursos Ativos</h2>
            <Button
              onClick={() => navigate('/cursos')}
              className="bg-primary hover:bg-primary/90"
            >
              Ver Todos os Cursos
            </Button>
          </div>

          {cursosAtivos.length === 0 ? (
            <Card className="p-12 text-center">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Nenhum curso ativo</h3>
              <p className="text-muted-foreground mb-4">
                Crie um novo curso para começar a captar inscrições
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
                  professor={professores.find(p => p.id === curso.professorId)}
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
