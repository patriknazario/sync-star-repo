import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { BookOpen, DollarSign, Users, TrendingUp } from 'lucide-react';
import {
  calculateTotalFaturamento,
  calculateTotalInscricoes,
  formatCurrency,
  validateDates,
  validatePositiveNumber,
} from '@/utils/calculations';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import type { Curso } from '@/hooks/useCursos';

export default function Dashboard() {
  const { anoSelecionado } = useApp();
  const { cursos, updateCurso, isLoading: cursosLoading } = useCursos();
  const { leads, isLoading: leadsLoading } = useLeads();
  const { professores, isLoading: professoresLoading } = useProfessores();
  const { metasGlobais, isLoading: metasLoading } = useMetasGlobais();
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCurso, setEditingCurso] = useState<Curso | null>(null);
  const [formData, setFormData] = useState<Partial<Curso>>({
    tema: '',
    professorId: professores[0]?.id || 0,
    cidade: '',
    estado: 'SP',
    dataInicio: '',
    dataTermino: '',
    cargaHoraria: 0,
    valorInscricao: 0,
    descricao: '',
    status: 'Planejado',
  });

  const metaGlobal = getMetaGlobalByAno(anoSelecionado);
  const metaAtual = metaGlobal?.valor ?? 0;

  const cursosAtivos = cursos
    .filter(c => c.status === 'Inscrições Abertas' || c.status === 'Em Andamento')
    .sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime());

  const totalFaturamento = calculateTotalFaturamento(leads);
  const totalInscricoes = calculateTotalInscricoes(leads);

  const handleAddLead = (cursoId: number) => {
    navigate(`/crm?curso=${cursoId}`);
  };

  const handleEditCurso = (cursoId: number) => {
    const curso = cursos.find(c => c.id === cursoId);
    if (curso) {
      setEditingCurso(curso);
      setFormData(curso);
      setIsEditDialogOpen(true);
    }
  };

  const handleSaveCurso = () => {
    if (!formData.tema || !formData.cidade || !formData.estado || !formData.dataInicio || !formData.dataTermino) {
      toast({ title: 'Erro', description: 'Preencha todos os campos obrigatórios', variant: 'destructive' });
      return;
    }

    const dateValidation = validateDates(formData.dataInicio, formData.dataTermino);
    if (!dateValidation.valid) {
      toast({ title: 'Erro', description: dateValidation.message, variant: 'destructive' });
      return;
    }

    if (formData.valorInscricao) {
      const valorValidation = validatePositiveNumber(formData.valorInscricao, 'Valor da inscrição');
      if (!valorValidation.valid) {
        toast({ title: 'Erro', description: valorValidation.message, variant: 'destructive' });
        return;
      }
    }

    if (formData.cargaHoraria) {
      const cargaValidation = validatePositiveNumber(formData.cargaHoraria, 'Carga horária');
      if (!cargaValidation.valid) {
        toast({ title: 'Erro', description: cargaValidation.message, variant: 'destructive' });
        return;
      }
    }

    if (editingCurso) {
      updateCurso(editingCurso.id, formData);
      toast({ title: 'Sucesso', description: 'Curso atualizado com sucesso!' });
    }
    
    setIsEditDialogOpen(false);
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
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>

          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-1">Meta: {formatCurrency(metaAtual)}</p>
            <p className="text-2xl font-bold text-foreground">Realizado: {formatCurrency(totalFaturamento)}</p>
          </div>

          <ProgressBar
            current={totalFaturamento}
            target={metaAtual}
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

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Curso</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="tema">Tema do Curso *</Label>
              <Input
                id="tema"
                value={formData.tema}
                onChange={(e) => setFormData({ ...formData, tema: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="professor">Professor *</Label>
                <Select
                  value={formData.professorId?.toString()}
                  onValueChange={(value) => setFormData({ ...formData, professorId: Number(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {professores.map((prof) => (
                      <SelectItem key={prof.id} value={prof.id.toString()}>
                        {prof.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planejado">Planejado</SelectItem>
                    <SelectItem value="Inscrições Abertas">Inscrições Abertas</SelectItem>
                    <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                    <SelectItem value="Concluído">Concluído</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cidade">Cidade *</Label>
                <Input
                  id="cidade"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="estado">Estado *</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value) => setFormData({ ...formData, estado: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['SP', 'RJ', 'MG', 'DF', 'BA', 'CE', 'PE', 'PR', 'RS', 'SC', 'GO', 'AM', 'PA'].map((estado) => (
                      <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dataInicio">Data Início *</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={formData.dataInicio}
                  onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="dataTermino">Data Término *</Label>
                <Input
                  id="dataTermino"
                  type="date"
                  value={formData.dataTermino}
                  onChange={(e) => setFormData({ ...formData, dataTermino: e.target.value })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cargaHoraria">Carga Horária (horas)</Label>
                <Input
                  id="cargaHoraria"
                  type="number"
                  value={formData.cargaHoraria}
                  onChange={(e) => setFormData({ ...formData, cargaHoraria: Number(e.target.value) })}
                />
              </div>
              
              <div>
                <Label htmlFor="valorInscricao">Valor da Inscrição (R$)</Label>
                <Input
                  id="valorInscricao"
                  type="number"
                  value={formData.valorInscricao}
                  onChange={(e) => setFormData({ ...formData, valorInscricao: Number(e.target.value) })}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveCurso} className="bg-accent hover:bg-accent/90">
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
