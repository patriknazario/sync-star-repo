import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Building, MapPin, DollarSign } from 'lucide-react';
import { Lead } from '@/data/mockData';
import { formatCurrency } from '@/utils/calculations';
import { toast } from 'sonner';

const estados = ['SP', 'RJ', 'MG', 'DF', 'BA', 'CE', 'PE', 'PR', 'RS', 'SC', 'GO', 'AM', 'PA'];

export default function CRM() {
  const { leads, cursos, vendedoras, addLead, updateLead, deleteLead, moveLeadStatus } = useApp();
  const [selectedCurso, setSelectedCurso] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [motivoDialog, setMotivoDialog] = useState<{ isOpen: boolean; leadId: number | null }>({
    isOpen: false,
    leadId: null,
  });
  const [motivoPerda, setMotivoPerda] = useState<Lead['motivoPerda']>();
  const [observacoes, setObservacoes] = useState('');

  const [formData, setFormData] = useState<Partial<Lead>>({
    cursoId: 0,
    nomeResponsavel: '',
    orgao: '',
    setor: '',
    cidade: '',
    estado: 'SP',
    telefone: '',
    email: '',
    quantidadeInscricoes: 1,
    valorProposta: 0,
    vendedoraId: 1,
    status: 'Proposta Enviada',
    dataCadastro: new Date().toISOString().split('T')[0],
  });

  const cursoSelecionado = selectedCurso ? cursos.find(c => c.id === selectedCurso) : null;
  const leadsDoCurso = leads.filter(l => l.cursoId === selectedCurso);

  const leadsPropostaEnviada = leadsDoCurso.filter(l => l.status === 'Proposta Enviada');
  const leadsInscricaoRealizada = leadsDoCurso.filter(l => l.status === 'Inscrição Realizada');
  const leadsPropostaDeclinada = leadsDoCurso.filter(l => l.status === 'Proposta Declinada');

  const handleOpenDialog = (lead?: Lead) => {
    if (lead) {
      setEditingLead(lead);
      setFormData(lead);
    } else {
      setEditingLead(null);
      const cursoId = selectedCurso || cursos[0]?.id || 0;
      const curso = cursos.find(c => c.id === cursoId);
      setFormData({
        cursoId,
        nomeResponsavel: '',
        orgao: '',
        setor: '',
        cidade: '',
        estado: 'SP',
        telefone: '',
        email: '',
        quantidadeInscricoes: 1,
        valorProposta: curso?.valorInscricao || 0,
        vendedoraId: vendedoras[0]?.id || 1,
        status: 'Proposta Enviada',
        dataCadastro: new Date().toISOString().split('T')[0],
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.nomeResponsavel || !formData.orgao || !formData.cidade) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const curso = cursos.find(c => c.id === formData.cursoId);
    const valorProposta = (formData.quantidadeInscricoes || 1) * (curso?.valorInscricao || 0);

    if (editingLead) {
      updateLead(editingLead.id, { ...formData, valorProposta });
      toast.success('Lead atualizado com sucesso!');
    } else {
      addLead({ ...formData, valorProposta } as Omit<Lead, 'id'>);
      toast.success('Lead cadastrado com sucesso!');
    }

    setIsDialogOpen(false);
  };

  const handleMoveStatus = (leadId: number, newStatus: Lead['status']) => {
    if (newStatus === 'Proposta Declinada') {
      setMotivoDialog({ isOpen: true, leadId });
    } else {
      moveLeadStatus(leadId, newStatus);
      toast.success('Status atualizado com sucesso!');
    }
  };

  const handleSaveMotivo = () => {
    if (motivoDialog.leadId && motivoPerda) {
      moveLeadStatus(motivoDialog.leadId, 'Proposta Declinada', motivoPerda, observacoes);
      setMotivoDialog({ isOpen: false, leadId: null });
      setMotivoPerda(undefined);
      setObservacoes('');
      toast.success('Lead movido para Proposta Declinada');
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este lead?')) {
      deleteLead(id);
      toast.success('Lead excluído com sucesso!');
    }
  };

  const renderLeadCard = (lead: Lead) => {
    const curso = cursos.find(c => c.id === lead.cursoId);
    const vendedora = vendedoras.find(v => v.id === lead.vendedoraId);

    return (
      <Card key={lead.id} className="p-4 hover:shadow-md transition-all bg-card cursor-move">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-foreground mb-1">{lead.nomeResponsavel}</h4>
            <div className="flex items-center text-sm text-muted-foreground mb-1">
              <Building className="h-3 w-3 mr-1" />
              {lead.orgao}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-3 w-3 mr-1" />
              {lead.cidade}, {lead.estado}
            </div>
          </div>
          <div className="flex space-x-1">
            <Button
              onClick={() => handleOpenDialog(lead)}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              onClick={() => handleDelete(lead.id)}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Qtd. Inscrições:</span>
            <span className="font-semibold">{lead.quantidadeInscricoes}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Valor Proposta:</span>
            <span className="font-semibold text-accent">{formatCurrency(lead.valorProposta)}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Vendedora: {vendedora?.nome}
          </div>
        </div>

        {lead.status === 'Proposta Enviada' && (
          <div className="flex space-x-2">
            <Button
              onClick={() => handleMoveStatus(lead.id, 'Inscrição Realizada')}
              size="sm"
              className="flex-1 bg-success hover:bg-success/90 text-xs"
            >
              Realizada
            </Button>
            <Button
              onClick={() => handleMoveStatus(lead.id, 'Proposta Declinada')}
              size="sm"
              variant="outline"
              className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground text-xs"
            >
              Recusada
            </Button>
          </div>
        )}

        {lead.motivoPerda && (
          <div className="mt-2 p-2 bg-destructive/10 rounded text-xs">
            <span className="font-semibold">Motivo: </span>{lead.motivoPerda}
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">CRM - Gestão de Leads</h1>
            <p className="text-muted-foreground mt-2">Pipeline de vendas por curso</p>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            className="bg-accent hover:bg-accent/90"
            disabled={!selectedCurso}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Lead
          </Button>
        </div>

        {/* Seletor de Curso */}
        <Card className="p-4 mb-6">
          <Label>Selecione um Curso</Label>
          <Select
            value={selectedCurso?.toString()}
            onValueChange={(value) => setSelectedCurso(Number(value))}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Escolha um curso" />
            </SelectTrigger>
            <SelectContent>
              {cursos.map((curso) => (
                <SelectItem key={curso.id} value={curso.id.toString()}>
                  {curso.tema} - {curso.cidade}/{curso.estado}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        {/* Kanban Board */}
        {selectedCurso && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Coluna 1: Proposta Enviada */}
            <div>
              <div className="bg-primary text-primary-foreground p-4 rounded-t-lg">
                <h3 className="font-semibold text-center">Proposta Enviada</h3>
                <p className="text-center text-sm opacity-90">{leadsPropostaEnviada.length} leads</p>
              </div>
              <div className="bg-muted/20 p-4 rounded-b-lg min-h-[400px] space-y-3">
                {leadsPropostaEnviada.map(renderLeadCard)}
              </div>
            </div>

            {/* Coluna 2: Inscrição Realizada */}
            <div>
              <div className="bg-success text-success-foreground p-4 rounded-t-lg">
                <h3 className="font-semibold text-center">Inscrição Realizada</h3>
                <p className="text-center text-sm opacity-90">{leadsInscricaoRealizada.length} leads</p>
              </div>
              <div className="bg-muted/20 p-4 rounded-b-lg min-h-[400px] space-y-3">
                {leadsInscricaoRealizada.map(renderLeadCard)}
              </div>
            </div>

            {/* Coluna 3: Proposta Declinada */}
            <div>
              <div className="bg-destructive text-destructive-foreground p-4 rounded-t-lg">
                <h3 className="font-semibold text-center">Proposta Declinada</h3>
                <p className="text-center text-sm opacity-90">{leadsPropostaDeclinada.length} leads</p>
              </div>
              <div className="bg-muted/20 p-4 rounded-b-lg min-h-[400px] space-y-3">
                {leadsPropostaDeclinada.map(renderLeadCard)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dialog Criar/Editar Lead */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLead ? 'Editar Lead' : 'Novo Lead'}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label>Curso *</Label>
              <Select
                value={formData.cursoId?.toString()}
                onValueChange={(value) => {
                  const cursoId = Number(value);
                  const curso = cursos.find(c => c.id === cursoId);
                  setFormData({
                    ...formData,
                    cursoId,
                    valorProposta: (formData.quantidadeInscricoes || 1) * (curso?.valorInscricao || 0),
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cursos.map((curso) => (
                    <SelectItem key={curso.id} value={curso.id.toString()}>
                      {curso.tema}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome do Responsável *</Label>
                <Input
                  value={formData.nomeResponsavel}
                  onChange={(e) => setFormData({ ...formData, nomeResponsavel: e.target.value })}
                />
              </div>
              <div>
                <Label>Vendedora *</Label>
                <Select
                  value={formData.vendedoraId?.toString()}
                  onValueChange={(value) => setFormData({ ...formData, vendedoraId: Number(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {vendedoras.map((v) => (
                      <SelectItem key={v.id} value={v.id.toString()}>
                        {v.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Órgão/Empresa *</Label>
                <Input
                  value={formData.orgao}
                  onChange={(e) => setFormData({ ...formData, orgao: e.target.value })}
                />
              </div>
              <div>
                <Label>Setor</Label>
                <Input
                  value={formData.setor}
                  onChange={(e) => setFormData({ ...formData, setor: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cidade *</Label>
                <Input
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                />
              </div>
              <div>
                <Label>Estado *</Label>
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
                <Label>Telefone</Label>
                <Input
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Quantidade de Inscrições</Label>
              <Input
                type="number"
                min="1"
                value={formData.quantidadeInscricoes}
                onChange={(e) => {
                  const qtd = Number(e.target.value);
                  const curso = cursos.find(c => c.id === formData.cursoId);
                  setFormData({
                    ...formData,
                    quantidadeInscricoes: qtd,
                    valorProposta: qtd * (curso?.valorInscricao || 0),
                  });
                }}
              />
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-semibold">Valor da Proposta</p>
              <p className="text-2xl font-bold text-accent">{formatCurrency(formData.valorProposta || 0)}</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-accent hover:bg-accent/90">
              {editingLead ? 'Salvar' : 'Criar Lead'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Motivo de Perda */}
      <Dialog open={motivoDialog.isOpen} onOpenChange={(open) => setMotivoDialog({ isOpen: open, leadId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Motivo da Perda</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Motivo *</Label>
              <Select value={motivoPerda} onValueChange={(value: any) => setMotivoPerda(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Preço">Preço</SelectItem>
                  <SelectItem value="Data do curso incompatível">Data do curso incompatível</SelectItem>
                  <SelectItem value="Sem orçamento">Sem orçamento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Observações</Label>
              <Textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMotivoDialog({ isOpen: false, leadId: null })}>
              Cancelar
            </Button>
            <Button onClick={handleSaveMotivo} className="bg-destructive hover:bg-destructive/90">
              Confirmar Perda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
