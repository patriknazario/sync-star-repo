import { useState } from 'react';
import { useLeads, Lead } from '@/hooks/useLeads';
import { useCursos } from '@/hooks/useCursos';
import { useVendedoras } from '@/hooks/useVendedoras';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye } from 'lucide-react';
import { formatCurrency } from '@/utils/calculations';
import { toast } from 'sonner';

const STATUS_COLORS = {
  'Proposta Enviada': 'bg-blue-500',
  'Em Negociação': 'bg-yellow-500',
  'Inscrição Realizada': 'bg-green-500',
  'Perdido': 'bg-red-500',
  'Cancelado': 'bg-gray-500'
};

export default function CRM() {
  const { leads, isLoading, addLead, updateLead } = useLeads();
  const { cursos } = useCursos();
  const { vendedoras } = useVendedoras();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState<Lead | null>(null);
  const [formData, setFormData] = useState({
    nome_responsavel: '',
    orgao: '',
    setor: '',
    cidade: '',
    estado: '',
    telefone: '',
    email: '',
    curso_id: '',
    vendedora_id: '',
    quantidade_inscricoes: 1,
    valor_proposta: 0,
    observacoes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addLead({
        ...formData,
        status: 'Proposta Enviada' as any,
        data_cadastro: new Date().toISOString().split('T')[0]
      });
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao criar lead:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      nome_responsavel: '',
      orgao: '',
      setor: '',
      cidade: '',
      estado: '',
      telefone: '',
      email: '',
      curso_id: '',
      vendedora_id: '',
      quantidade_inscricoes: 1,
      valor_proposta: 0,
      observacoes: ''
    });
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      await updateLead({
        id: leadId,
        status: newStatus as any,
        data_conversao: newStatus === 'Inscrição Realizada' ? new Date().toISOString().split('T')[0] : null
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const groupedLeads = {
    'Proposta Enviada': leads.filter(l => l.status === 'Proposta Enviada'),
    'Em Negociação': leads.filter(l => (l.status as any) === 'Em Negociação'),
    'Inscrição Realizada': leads.filter(l => l.status === 'Inscrição Realizada'),
    'Perdido': leads.filter(l => (l.status as any) === 'Perdido'),
    'Cancelado': leads.filter(l => (l.status as any) === 'Cancelado')
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Carregando CRM...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">CRM</h1>
            <p className="text-muted-foreground">Funil de vendas e gestão de leads</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo Lead</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Responsável *</Label>
                    <Input
                      required
                      value={formData.nome_responsavel}
                      onChange={e => setFormData({ ...formData, nome_responsavel: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Órgão *</Label>
                    <Input
                      required
                      value={formData.orgao}
                      onChange={e => setFormData({ ...formData, orgao: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Cidade *</Label>
                    <Input
                      required
                      value={formData.cidade}
                      onChange={e => setFormData({ ...formData, cidade: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado *</Label>
                    <Input
                      required
                      maxLength={2}
                      value={formData.estado}
                      onChange={e => setFormData({ ...formData, estado: e.target.value.toUpperCase() })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Setor</Label>
                    <Input
                      value={formData.setor}
                      onChange={e => setFormData({ ...formData, setor: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input
                      value={formData.telefone}
                      onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Curso *</Label>
                    <Select value={formData.curso_id} onValueChange={v => setFormData({ ...formData, curso_id: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {cursos.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.tema} - {c.cidade}/{c.estado}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Vendedora *</Label>
                    <Select value={formData.vendedora_id} onValueChange={v => setFormData({ ...formData, vendedora_id: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {vendedoras.map(v => (
                          <SelectItem key={v.id} value={v.id}>{v.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quantidade de Inscrições *</Label>
                    <Input
                      type="number"
                      min="1"
                      required
                      value={formData.quantidade_inscricoes}
                      onChange={e => setFormData({ ...formData, quantidade_inscricoes: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valor Proposta *</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={formData.valor_proposta}
                      onChange={e => setFormData({ ...formData, valor_proposta: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea
                    rows={3}
                    value={formData.observacoes}
                    onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Criar Lead</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(groupedLeads).map(([status, statusLeads]) => (
            <Card key={status} className="flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${STATUS_COLORS[status as keyof typeof STATUS_COLORS]}`} />
                  {status}
                  <Badge variant="secondary" className="ml-auto">{statusLeads.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 flex-1">
                {statusLeads.map(lead => {
                  const curso = cursos.find(c => c.id === lead.curso_id);
                  return (
                    <Card key={lead.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setDetailsDialog(lead)}>
                      <h4 className="font-bold text-sm mb-1">{lead.orgao}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{lead.nome_responsavel}</p>
                      <p className="text-xs mb-1">{curso?.tema}</p>
                      <p className="text-xs text-muted-foreground mb-2">{lead.cidade}/{lead.estado}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary">
                          {formatCurrency(lead.valor_proposta)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {lead.quantidade_inscricoes} insc.
                        </Badge>
                      </div>
                    </Card>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>

        {detailsDialog && (
          <Dialog open={!!detailsDialog} onOpenChange={() => setDetailsDialog(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Detalhes do Lead</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Órgão</Label>
                  <p className="font-bold">{detailsDialog.orgao}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Responsável</Label>
                  <p>{detailsDialog.nome_responsavel}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Cidade/Estado</Label>
                    <p>{detailsDialog.cidade}/{detailsDialog.estado}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Status Atual</Label>
                    <Badge>{detailsDialog.status}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Alterar Status</Label>
                  <Select
                    value={detailsDialog.status}
                    onValueChange={v => handleStatusChange(detailsDialog.id, v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(STATUS_COLORS).map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {detailsDialog.observacoes && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Observações</Label>
                    <p className="text-sm">{detailsDialog.observacoes}</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
