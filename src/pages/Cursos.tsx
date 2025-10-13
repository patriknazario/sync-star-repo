import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCursos } from '@/hooks/useCursos';
import { useProfessores } from '@/hooks/useProfessores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDate, formatCurrency } from '@/utils/calculations';
import { toast } from 'sonner';

const estados = ['SP', 'RJ', 'MG', 'DF', 'BA', 'CE', 'PE', 'PR', 'RS', 'SC', 'GO', 'AM', 'PA'];

export default function Cursos() {
  const { cursos, addCurso, updateCurso, deleteCurso } = useCursos();
  const { professores: profs } = useProfessores();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCurso, setEditingCurso] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    tema: '',
    professor_id: profs[0]?.id || '',
    cidade: '',
    estado: 'SP',
    data_inicio: '',
    data_termino: '',
    carga_horaria: 0,
    valor_inscricao: 0,
    descricao: '',
    status: 'Planejado' as any,
  });

  const filteredCursos = cursos.filter(curso => {
    const matchesSearch = curso.tema.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curso.cidade.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || curso.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const cursosAtivos = filteredCursos.filter(c => c.status !== 'Cancelado' && c.status !== 'Concluído');
  const cursosInativos = filteredCursos.filter(c => c.status === 'Cancelado' || c.status === 'Concluído');

  const handleOpenDialog = (curso?: any) => {
    if (curso) {
      setEditingCurso(curso);
      setFormData({
        tema: curso.tema,
        professor_id: curso.professor_id,
        cidade: curso.cidade,
        estado: curso.estado,
        data_inicio: curso.data_inicio,
        data_termino: curso.data_termino,
        carga_horaria: curso.carga_horaria,
        valor_inscricao: curso.valor_inscricao,
        descricao: curso.descricao,
        status: curso.status,
      });
    } else {
      setEditingCurso(null);
      setFormData({
        tema: '',
        professor_id: profs[0]?.id || '',
        cidade: '',
        estado: 'SP',
        data_inicio: '',
        data_termino: '',
        carga_horaria: 0,
        valor_inscricao: 0,
        descricao: '',
        status: 'Planejado',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.tema || !formData.cidade) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      if (editingCurso) {
        await updateCurso({ id: editingCurso.id, ...formData });
      } else {
        await addCurso(formData);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este curso?')) {
      await deleteCurso(id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestão de Cursos</h1>
            <p className="text-muted-foreground mt-2">Gerencie todos os cursos</p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="bg-accent hover:bg-accent/90">
            <Plus className="h-4 w-4 mr-2" />
            Novo Curso
          </Button>
        </div>

        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por tema, cidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Planejado">Planejado</SelectItem>
                <SelectItem value="Inscrições Abertas">Inscrições Abertas</SelectItem>
                <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                <SelectItem value="Concluído">Concluído</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Cursos Ativos</h2>
          <div className="grid gap-4">
            {cursosAtivos.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Nenhum curso ativo encontrado</p>
              </Card>
            ) : (
              cursosAtivos.map((curso) => (
                <Card key={curso.id} onClick={() => navigate(`/curso/${curso.id}`)} className="p-6 hover:shadow-lg transition-all cursor-pointer">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{curso.tema}</h3>
                      <StatusBadge status={curso.status} />
                      <div className="mt-4 space-y-2 text-sm">
                        <p><span className="text-muted-foreground">Cidade:</span> {curso.cidade}, {curso.estado}</p>
                        <p><span className="text-muted-foreground">Período:</span> {formatDate(curso.data_inicio)} - {formatDate(curso.data_termino)}</p>
                        <p><span className="text-muted-foreground">Valor:</span> {formatCurrency(curso.valor_inscricao)}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button onClick={(e) => { e.stopPropagation(); handleOpenDialog(curso); }} variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button onClick={(e) => { e.stopPropagation(); handleDelete(curso.id); }} variant="outline" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {cursosInativos.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Cancelados/Concluídos</h2>
            <div className="grid gap-4 opacity-75">
              {cursosInativos.map((curso) => (
                <Card key={curso.id} className="p-6">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{curso.tema}</h3>
                      <StatusBadge status={curso.status} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCurso ? 'Editar Curso' : 'Novo Curso'}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label>Tema *</Label>
              <Input value={formData.tema} onChange={(e) => setFormData({ ...formData, tema: e.target.value })} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Professor *</Label>
                <Select value={formData.professor_id} onValueChange={(value) => setFormData({ ...formData, professor_id: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {profs.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                <Label>Cidade *</Label>
                <Input value={formData.cidade} onChange={(e) => setFormData({ ...formData, cidade: e.target.value })} />
              </div>
              <div>
                <Label>Estado *</Label>
                <Select value={formData.estado} onValueChange={(value) => setFormData({ ...formData, estado: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {estados.map((e) => (<SelectItem key={e} value={e}>{e}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data Início *</Label>
                <Input type="date" value={formData.data_inicio} onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })} />
              </div>
              <div>
                <Label>Data Término *</Label>
                <Input type="date" value={formData.data_termino} onChange={(e) => setFormData({ ...formData, data_termino: e.target.value })} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Carga Horária (h) *</Label>
                <Input type="number" value={formData.carga_horaria} onChange={(e) => setFormData({ ...formData, carga_horaria: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Valor Inscrição (R$) *</Label>
                <Input type="number" value={formData.valor_inscricao} onChange={(e) => setFormData({ ...formData, valor_inscricao: Number(e.target.value) })} />
              </div>
            </div>
            
            <div>
              <Label>Descrição</Label>
              <Textarea value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} rows={3} />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-accent hover:bg-accent/90">{editingCurso ? 'Salvar' : 'Criar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
