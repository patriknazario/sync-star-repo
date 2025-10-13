import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/common/StatusBadge';

import { ArrowLeft, Edit, Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { formatDate, formatCurrency } from '@/utils/calculations';
import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Curso } from '@/data/mockData';
import { validateDates, validatePositiveNumber } from '@/utils/calculations';
import { toast } from 'sonner';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const estados = ['SP', 'RJ', 'MG', 'DF', 'BA', 'CE', 'PE', 'PR', 'RS', 'SC', 'GO', 'AM', 'PA'];

export default function DetalheCurso() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cursos, leads, professores, vendedoras, getInscricoesCurso, updateCurso } = useApp();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Curso>>({});
  
  const curso = cursos.find(c => c.id === Number(id));
  
  if (!curso) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-warning mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Curso não encontrado</h2>
          <p className="text-muted-foreground mb-4">O curso que você está procurando não existe.</p>
          <Button onClick={() => navigate('/cursos')}>
            Voltar para Cursos
          </Button>
        </Card>
      </div>
    );
  }

  const professor = professores.find(p => p.id === curso.professorId);
  const leadsNoCurso = leads.filter(l => l.cursoId === Number(id));
  
  // Separar leads por status
  const leadsConvertidos = leadsNoCurso.filter(l => l.status === 'Inscrição Realizada');
  const leadsPendentes = leadsNoCurso.filter(l => l.status === 'Proposta Enviada');
  const leadsDeclinados = leadsNoCurso.filter(l => l.status === 'Proposta Declinada');
  
  // Calcular métricas
  const inscricoes = getInscricoesCurso(curso.id);
  const faturamento = leadsConvertidos.reduce((sum, l) => sum + (l.valorNegociado ?? l.valorProposta), 0);
  const receitaPotencial = leadsPendentes.reduce((sum, l) => sum + l.valorProposta, 0);
  const taxaConversao = leadsNoCurso.length > 0 
    ? ((leadsConvertidos.length / leadsNoCurso.length) * 100).toFixed(1) 
    : '0';
  const ticketMedio = leadsConvertidos.length > 0 
    ? faturamento / leadsConvertidos.length 
    : 0;

  // Dados para gráficos
  const faturamentoPorVendedora = vendedoras
    .map(v => ({
      nome: v.nome,
      faturamento: leadsConvertidos
        .filter(l => l.vendedoraId === v.id)
        .reduce((sum, l) => sum + (l.valorNegociado ?? l.valorProposta), 0)
    }))
    .filter(v => v.faturamento > 0)
    .sort((a, b) => b.faturamento - a.faturamento);

  const distribuicaoGeografica = Object.entries(
    leadsNoCurso.reduce((acc, lead) => {
      acc[lead.estado] = (acc[lead.estado] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([estado, count]) => ({ estado, count }));

  const motivosPerda = Object.entries(
    leadsDeclinados.reduce((acc, lead) => {
      if (lead.motivoPerda) {
        acc[lead.motivoPerda] = (acc[lead.motivoPerda] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>)
  ).map(([motivo, count]) => ({ motivo, count }));

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

  const handleOpenEditDialog = () => {
    setFormData(curso);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!formData.tema || !formData.cidade || !formData.estado || !formData.dataInicio || !formData.dataTermino) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const dateValidation = validateDates(formData.dataInicio, formData.dataTermino);
    if (!dateValidation.valid) {
      toast.error(dateValidation.message!);
      return;
    }

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

    updateCurso(curso.id, formData);
    toast.success('Curso atualizado com sucesso!');
    setIsEditDialogOpen(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground">{curso.tema}</h1>
                <StatusBadge status={curso.status} />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Professor</p>
                  <p className="font-medium text-foreground">{professor?.nome}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Localização</p>
                  <p className="font-medium text-foreground">{curso.cidade}, {curso.estado}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Período</p>
                  <p className="font-medium text-foreground">{formatDate(curso.dataInicio)} - {formatDate(curso.dataTermino)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Carga Horária</p>
                  <p className="font-medium text-foreground">{curso.cargaHoraria}h</p>
                </div>
              </div>
            </div>
            
            <Button
              onClick={handleOpenEditDialog}
              className="ml-4 bg-accent hover:bg-accent/90"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar Curso
            </Button>
          </div>

          <div className="mt-4">
            <p className="text-sm text-muted-foreground">{curso.descricao}</p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Total de Leads</h3>
              <Users className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">{leadsNoCurso.length}</p>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Inscrições Confirmadas</h3>
              <Users className="h-5 w-5 text-success" />
            </div>
            <p className="text-3xl font-bold text-foreground">{inscricoes}</p>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Faturamento Realizado</h3>
              <DollarSign className="h-5 w-5 text-success" />
            </div>
            <p className="text-3xl font-bold text-success">{formatCurrency(faturamento)}</p>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Taxa de Conversão</h3>
              <TrendingUp className="h-5 w-5 text-accent" />
            </div>
            <p className="text-3xl font-bold text-foreground">{taxaConversao}%</p>
          </Card>
        </div>

        {/* Tabela de Leads */}
        <Card className="mb-8">
          <Tabs defaultValue="convertidos" className="w-full">
            <div className="border-b">
              <TabsList className="w-full justify-start rounded-none h-auto p-0 bg-transparent">
                <TabsTrigger value="convertidos" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  Inscrições Realizadas ({leadsConvertidos.length})
                </TabsTrigger>
                <TabsTrigger value="pendentes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  Propostas Enviadas ({leadsPendentes.length})
                </TabsTrigger>
                <TabsTrigger value="declinados" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  Declinadas/Canceladas ({leadsDeclinados.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="convertidos" className="p-6">
              {leadsConvertidos.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhuma inscrição realizada ainda</p>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Órgão</TableHead>
                        <TableHead>Responsável</TableHead>
                        <TableHead>Cidade/UF</TableHead>
                        <TableHead className="text-right">Qtd Inscrições</TableHead>
                        <TableHead className="text-right">Valor Negociado</TableHead>
                        <TableHead>Vendedora</TableHead>
                        <TableHead>Data Conversão</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leadsConvertidos.map((lead) => {
                        const vendedora = vendedoras.find(v => v.id === lead.vendedoraId);
                        return (
                          <TableRow key={lead.id}>
                            <TableCell className="font-medium">{lead.orgao}</TableCell>
                            <TableCell>{lead.nomeResponsavel}</TableCell>
                            <TableCell>{lead.cidade}/{lead.estado}</TableCell>
                            <TableCell className="text-right">{lead.quantidadeInscricoes}</TableCell>
                            <TableCell className="text-right font-semibold text-success">
                              {formatCurrency(lead.valorNegociado ?? lead.valorProposta)}
                            </TableCell>
                            <TableCell>{vendedora?.nome}</TableCell>
                            <TableCell>{lead.dataConversao ? formatDate(lead.dataConversao) : '-'}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      Total de inscrições: <span className="font-bold text-foreground">{inscricoes}</span>
                    </p>
                    <p className="text-lg font-bold text-success">
                      Total: {formatCurrency(faturamento)}
                    </p>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="pendentes" className="p-6">
              {leadsPendentes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhuma proposta pendente</p>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Órgão</TableHead>
                        <TableHead>Responsável</TableHead>
                        <TableHead>Cidade/UF</TableHead>
                        <TableHead className="text-right">Qtd Inscrições</TableHead>
                        <TableHead className="text-right">Valor Proposta</TableHead>
                        <TableHead>Vendedora</TableHead>
                        <TableHead>Data Cadastro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leadsPendentes.map((lead) => {
                        const vendedora = vendedoras.find(v => v.id === lead.vendedoraId);
                        return (
                          <TableRow key={lead.id}>
                            <TableCell className="font-medium">{lead.orgao}</TableCell>
                            <TableCell>{lead.nomeResponsavel}</TableCell>
                            <TableCell>{lead.cidade}/{lead.estado}</TableCell>
                            <TableCell className="text-right">{lead.quantidadeInscricoes}</TableCell>
                            <TableCell className="text-right font-semibold text-warning">
                              {formatCurrency(lead.valorProposta)}
                            </TableCell>
                            <TableCell>{vendedora?.nome}</TableCell>
                            <TableCell>{formatDate(lead.dataCadastro)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  <div className="mt-4 pt-4 border-t flex justify-end">
                    <p className="text-lg font-bold text-warning">
                      Receita Potencial: {formatCurrency(receitaPotencial)}
                    </p>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="declinados" className="p-6">
              {leadsDeclinados.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhuma proposta declinada</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Órgão</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Motivo da Perda</TableHead>
                      <TableHead className="text-right">Valor Proposta</TableHead>
                      <TableHead>Vendedora</TableHead>
                      <TableHead>Data Cadastro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leadsDeclinados.map((lead) => {
                      const vendedora = vendedoras.find(v => v.id === lead.vendedoraId);
                      return (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">{lead.orgao}</TableCell>
                          <TableCell>{lead.nomeResponsavel}</TableCell>
                          <TableCell>
                            <span className="text-destructive">{lead.motivoPerda || 'Não informado'}</span>
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {formatCurrency(lead.valorProposta)}
                          </TableCell>
                          <TableCell>{vendedora?.nome}</TableCell>
                          <TableCell>{formatDate(lead.dataCadastro)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </Card>

        {/* Análise de Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Faturamento por Vendedora */}
          {faturamentoPorVendedora.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Faturamento por Vendedora</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={faturamentoPorVendedora}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="nome" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: any) => formatCurrency(value)}
                  />
                  <Bar dataKey="faturamento" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Distribuição Geográfica */}
          {distribuicaoGeografica.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Distribuição Geográfica dos Leads</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={distribuicaoGeografica}
                    dataKey="count"
                    nameKey="estado"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.estado}: ${entry.count}`}
                  >
                    {distribuicaoGeografica.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Motivos de Perda */}
          {motivosPerda.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Motivos de Perda</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={motivosPerda}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="motivo" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--destructive))" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Estatísticas Adicionais */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Estatísticas do Curso</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-sm text-muted-foreground">Valor da Inscrição</span>
                <span className="font-semibold text-foreground">{formatCurrency(curso.valorInscricao)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-sm text-muted-foreground">Ticket Médio</span>
                <span className="font-semibold text-foreground">{formatCurrency(ticketMedio)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-sm text-muted-foreground">Total de Leads</span>
                <span className="font-semibold text-foreground">{leadsNoCurso.length}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-sm text-muted-foreground">Leads Convertidos</span>
                <span className="font-semibold text-success">{leadsConvertidos.length}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-sm text-muted-foreground">Leads Pendentes</span>
                <span className="font-semibold text-warning">{leadsPendentes.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Leads Declinados</span>
                <span className="font-semibold text-destructive">{leadsDeclinados.length}</span>
              </div>
            </div>
          </Card>
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
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} className="bg-accent hover:bg-accent/90">
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
