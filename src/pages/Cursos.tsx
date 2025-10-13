import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
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
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Curso } from '@/data/mockData';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDate, formatCurrency, validateDates, validatePositiveNumber } from '@/utils/calculations';
import { toast } from 'sonner';

const estados = ['SP', 'RJ', 'MG', 'DF', 'BA', 'CE', 'PE', 'PR', 'RS', 'SC', 'GO', 'AM', 'PA'];

export default function Cursos() {
  const { cursos, professores, addCurso, updateCurso, deleteCurso, getInscricoesCurso } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  const filteredCursos = cursos.filter(curso => {
    const matchesSearch = curso.tema.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curso.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curso.estado.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || curso.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime());

  // Separar cursos ativos dos inativos (Cancelados e Concluídos)
  const cursosAtivos = filteredCursos.filter(c => 
    c.status !== 'Cancelado' && c.status !== 'Concluído'
  );
  
  const cursosInativos = filteredCursos.filter(c => 
    c.status === 'Cancelado' || c.status === 'Concluído'
  );

  const handleOpenDialog = (curso?: Curso) => {
    if (curso) {
      setEditingCurso(curso);
      setFormData(curso);
    } else {
      setEditingCurso(null);
      setFormData({
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
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.tema || !formData.cidade || !formData.estado || !formData.dataInicio || !formData.dataTermino) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    // Validar datas
    const dateValidation = validateDates(formData.dataInicio, formData.dataTermino);
    if (!dateValidation.valid) {
      toast.error(dateValidation.message!);
      return;
    }

    // Validar valores numéricos positivos
    if (formData.valorInscricao) {
      const valorValidation = validatePositiveNumber(formData.valorInscricao, 'Valor da inscrição');
      if (!valorValidation.valid) {
        toast.error(valorValidation.message!);
        return;
      }
    }

    if (formData.cargaHoraria) {
      const cargaValidation = validatePositiveNumber(formData.cargaHoraria, 'Carga horária');
      if (!cargaValidation.valid) {
        toast.error(cargaValidation.message!);
        return;
      }
    }

    if (editingCurso) {
      updateCurso(editingCurso.id, formData);
      toast.success('Curso atualizado com sucesso!');
    } else {
      addCurso(formData as Omit<Curso, 'id'>);
      toast.success('Curso criado com sucesso!');
    }
    
    setIsDialogOpen(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este curso?')) {
      deleteCurso(id);
      toast.success('Curso excluído com sucesso!');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestão de Cursos</h1>
            <p className="text-muted-foreground mt-2">Gerencie todos os cursos da CGP</p>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            className="bg-accent hover:bg-accent/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Curso
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por tema, cidade ou estado..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="Planejado">Planejado</SelectItem>
                  <SelectItem value="Inscrições Abertas">Inscrições Abertas</SelectItem>
                  <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Cursos Ativos */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Cursos Ativos</h2>
          <div className="grid grid-cols-1 gap-4">
            {cursosAtivos.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Nenhum curso ativo encontrado</p>
              </Card>
            ) : (
              cursosAtivos.map((curso) => {
                const professor = professores.find(p => p.id === curso.professorId);
                return (
                  <Card key={curso.id} className="p-6 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-foreground">{curso.tema}</h3>
                          <StatusBadge status={curso.status} />
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Professor</p>
                            <p className="font-medium">{professor?.nome}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Localização</p>
                            <p className="font-medium">{curso.cidade}, {curso.estado}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Período</p>
                            <p className="font-medium">{formatDate(curso.dataInicio)} - {formatDate(curso.dataTermino)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Valor</p>
                            <p className="font-medium text-accent">{formatCurrency(curso.valorInscricao)}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <p className="text-xs text-muted-foreground">Descrição</p>
                          <p className="text-sm mt-1">{curso.descricao}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          onClick={() => handleOpenDialog(curso)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(curso.id)}
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Cursos Cancelados/Concluídos */}
        {cursosInativos.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Cursos Cancelados/Concluídos</h2>
            <div className="grid grid-cols-1 gap-4">
              {cursosInativos.map((curso) => {
                const professor = professores.find(p => p.id === curso.professorId);
                return (
                  <Card key={curso.id} className="p-6 hover:shadow-lg transition-all opacity-75">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-foreground">{curso.tema}</h3>
                          <StatusBadge status={curso.status} />
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Professor</p>
                            <p className="font-medium">{professor?.nome}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Localização</p>
                            <p className="font-medium">{curso.cidade}, {curso.estado}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Período</p>
                            <p className="font-medium">{formatDate(curso.dataInicio)} - {formatDate(curso.dataTermino)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Valor</p>
                            <p className="font-medium text-accent">{formatCurrency(curso.valorInscricao)}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <p className="text-xs text-muted-foreground">Descrição</p>
                          <p className="text-sm mt-1">{curso.descricao}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          onClick={() => handleOpenDialog(curso)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(curso.id)}
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCurso ? 'Editar Curso' : 'Novo Curso'}</DialogTitle>
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
                    {estados.map((estado) => (
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
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-accent hover:bg-accent/90">
              {editingCurso ? 'Salvar Alterações' : 'Criar Curso'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
