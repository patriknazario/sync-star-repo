import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/common/ProgressBar';
import { Target, Users, TrendingUp, Edit2, Trash2, AlertTriangle, Plus } from 'lucide-react';
import { formatCurrency } from '@/utils/calculations';
import { toast } from '@/hooks/use-toast';

export default function GestaoMetas() {
  const { 
    vendedoras, 
    cursos,
    metasGlobais,
    taxasComissao,
    anoSelecionado,
    setAnoSelecionado,
    getMetaGlobalByAno,
    updateMetaGlobal,
    calcRealizadoAno,
    updateVendedoraMeta,
    addTaxaComissao,
    deleteTaxaComissao,
  } = useApp();

  const metaGlobal = getMetaGlobalByAno(anoSelecionado);
  const realizado = calcRealizadoAno(anoSelecionado);
  const somaMetas = vendedoras.reduce((sum, v) => sum + v.metaAnual, 0);
  const excedeMetaGlobal = somaMetas > (metaGlobal?.valor ?? 0);

  // Estados para edição de Meta Global
  const [formMetaValor, setFormMetaValor] = useState(metaGlobal?.valor ?? 0);
  const [formMetaDescricao, setFormMetaDescricao] = useState(metaGlobal?.descricao ?? '');

  // Estados para edição de Vendedora
  const [isEditVendedoraOpen, setIsEditVendedoraOpen] = useState(false);
  const [editingVendedora, setEditingVendedora] = useState<any>(null);
  const [formMetaMensal, setFormMetaMensal] = useState(0);
  const [formMetaAnual, setFormMetaAnual] = useState(0);

  // Estados para adicionar Taxa de Comissão
  const [isAddTaxaOpen, setIsAddTaxaOpen] = useState(false);
  const [formTaxa, setFormTaxa] = useState(5.0);
  const [formVendedoraId, setFormVendedoraId] = useState<number | undefined>(undefined);
  const [formCursoId, setFormCursoId] = useState<number | undefined>(undefined);

  // Atualizar quando o ano mudar
  const handleAnoChange = (ano: string) => {
    setAnoSelecionado(Number(ano));
    const novaMeta = getMetaGlobalByAno(Number(ano));
    setFormMetaValor(novaMeta?.valor ?? 0);
    setFormMetaDescricao(novaMeta?.descricao ?? '');
  };

  // Atualizar Meta Global
  const handleUpdateMetaGlobal = () => {
    if (formMetaValor <= 0) {
      toast({
        title: "Erro",
        description: "O valor da meta deve ser maior que zero",
        variant: "destructive"
      });
      return;
    }

    updateMetaGlobal(anoSelecionado, {
      valor: formMetaValor,
      descricao: formMetaDescricao
    });

    toast({
      title: "Sucesso",
      description: "Meta global atualizada com sucesso!"
    });
  };

  // Editar Meta de Vendedora
  const handleEditVendedora = (vendedora: any) => {
    setEditingVendedora(vendedora);
    setFormMetaMensal(vendedora.metaMensal);
    setFormMetaAnual(vendedora.metaAnual);
    setIsEditVendedoraOpen(true);
  };

  const handleSaveVendedoraMeta = () => {
    if (formMetaMensal <= 0 || formMetaAnual <= 0) {
      toast({
        title: "Erro",
        description: "As metas devem ser maiores que zero",
        variant: "destructive"
      });
      return;
    }

    updateVendedoraMeta(editingVendedora.id, formMetaMensal, formMetaAnual);
    
    toast({
      title: "Sucesso",
      description: "Meta da vendedora atualizada com sucesso!"
    });

    setIsEditVendedoraOpen(false);
  };

  // Adicionar Taxa de Comissão
  const handleAddTaxa = () => {
    if (formTaxa <= 0 || formTaxa > 100) {
      toast({
        title: "Erro",
        description: "A taxa deve estar entre 0% e 100%",
        variant: "destructive"
      });
      return;
    }

    const tipo: 'Padrão' | 'Específica' = (!formVendedoraId && !formCursoId) ? 'Padrão' : 'Específica';

    addTaxaComissao({
      taxa: formTaxa,
      vendedoraId: formVendedoraId,
      cursoId: formCursoId,
      tipo
    });

    toast({
      title: "Sucesso",
      description: "Taxa de comissão adicionada com sucesso!"
    });

    // Reset
    setFormTaxa(5.0);
    setFormVendedoraId(undefined);
    setFormCursoId(undefined);
    setIsAddTaxaOpen(false);
  };

  const handleDeleteTaxa = (id: number) => {
    deleteTaxaComissao(id);
    toast({
      title: "Sucesso",
      description: "Taxa de comissão removida com sucesso!"
    });
  };

  const calcPercentualGlobal = (metaAnual: number): number => {
    const metaGlobalValor = metaGlobal?.valor ?? 1;
    return metaGlobalValor > 0 ? Math.round((metaAnual / metaGlobalValor) * 100) : 0;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Gestão de Metas</h1>
          <p className="text-muted-foreground">Configure e monitore as metas da empresa e vendedoras</p>
        </div>
        <div className="w-32">
          <Select value={anoSelecionado.toString()} onValueChange={handleAnoChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Alerta Condicional */}
      {excedeMetaGlobal && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atenção!</strong> A soma das metas individuais ({formatCurrency(somaMetas)}) excede a meta global ({formatCurrency(metaGlobal?.valor ?? 0)}).
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="meta-global" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="meta-global" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Meta Global
          </TabsTrigger>
          <TabsTrigger value="vendedores" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Metas por Vendedor
          </TabsTrigger>
          <TabsTrigger value="comissoes" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Comissões
          </TabsTrigger>
        </TabsList>

        {/* Aba Meta Global */}
        <TabsContent value="meta-global">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Visualização */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Meta Global {anoSelecionado}
                </CardTitle>
                <CardDescription>Objetivo anual da empresa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="text-4xl font-bold text-primary mb-4">
                    {formatCurrency(metaGlobal?.valor ?? 0)}
                  </div>
                  
                  <ProgressBar 
                    current={realizado} 
                    target={metaGlobal?.valor ?? 1}
                  />
                  
                  <p className="text-sm text-muted-foreground mt-2">
                    Realizado: {formatCurrency(realizado)} ({metaGlobal?.valor ? Math.round((realizado / metaGlobal.valor) * 100) : 0}%)
                  </p>
                </div>

                {metaGlobal?.descricao && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {metaGlobal.descricao}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Edição */}
            <Card>
              <CardHeader>
                <CardTitle>Editar Meta Global</CardTitle>
                <CardDescription>Altere o valor e a descrição da meta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="meta-valor">Meta Anual (R$)</Label>
                  <Input
                    id="meta-valor"
                    type="number"
                    value={formMetaValor}
                    onChange={(e) => setFormMetaValor(Number(e.target.value))}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="meta-descricao">Descrição</Label>
                  <Textarea
                    id="meta-descricao"
                    value={formMetaDescricao}
                    onChange={(e) => setFormMetaDescricao(e.target.value)}
                    rows={4}
                    className="mt-2"
                    placeholder="Descreva o significado ou recompensas ao atingir a meta..."
                  />
                </div>

                <Button 
                  onClick={handleUpdateMetaGlobal} 
                  className="w-full bg-accent hover:bg-accent/90"
                >
                  Atualizar Meta
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba Metas por Vendedor */}
        <TabsContent value="vendedores">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Metas por Vendedor - {anoSelecionado}</CardTitle>
                  <CardDescription className="mt-2">
                    Total das metas individuais: <span className="font-semibold text-foreground">{formatCurrency(somaMetas)}</span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendedor</TableHead>
                    <TableHead className="text-right">Meta Mensal</TableHead>
                    <TableHead className="text-right">Meta Anual</TableHead>
                    <TableHead className="text-right">% da Meta Global</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendedoras.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.nome}</TableCell>
                      <TableCell className="text-right">{formatCurrency(v.metaMensal)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(v.metaAnual)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{calcPercentualGlobal(v.metaAnual)}%</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditVendedora(v)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Comissões */}
        <TabsContent value="comissoes">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Taxas de Comissão</CardTitle>
                  <CardDescription>Configure as taxas de comissão padrão e específicas</CardDescription>
                </div>
                <Button onClick={() => setIsAddTaxaOpen(true)} className="bg-accent hover:bg-accent/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Taxa
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Taxa</TableHead>
                    <TableHead>Vendedor</TableHead>
                    <TableHead>Curso</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxasComissao.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-semibold">{t.taxa}%</TableCell>
                      <TableCell>
                        {t.vendedoraId 
                          ? vendedoras.find(v => v.id === t.vendedoraId)?.nome 
                          : <span className="text-muted-foreground">Todos</span>
                        }
                      </TableCell>
                      <TableCell>
                        {t.cursoId 
                          ? cursos.find(c => c.id === t.cursoId)?.tema 
                          : <span className="text-muted-foreground">Todos</span>
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant={t.tipo === 'Padrão' ? 'default' : 'secondary'}>
                          {t.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTaxa(t.id)}
                          disabled={t.tipo === 'Padrão' && taxasComissao.length === 1}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Editar Vendedora */}
      <Dialog open={isEditVendedoraOpen} onOpenChange={setIsEditVendedoraOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Meta - {editingVendedora?.nome}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="meta-mensal">Meta Mensal (R$)</Label>
              <Input
                id="meta-mensal"
                type="number"
                value={formMetaMensal}
                onChange={(e) => setFormMetaMensal(Number(e.target.value))}
              />
            </div>
            
            <div>
              <Label htmlFor="meta-anual">Meta Anual (R$)</Label>
              <Input
                id="meta-anual"
                type="number"
                value={formMetaAnual}
                onChange={(e) => setFormMetaAnual(Number(e.target.value))}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditVendedoraOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveVendedoraMeta} className="bg-accent hover:bg-accent/90">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Adicionar Taxa */}
      <Dialog open={isAddTaxaOpen} onOpenChange={setIsAddTaxaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Taxa de Comissão</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="taxa">Taxa (%)</Label>
              <Input
                id="taxa"
                type="number"
                step="0.1"
                value={formTaxa}
                onChange={(e) => setFormTaxa(Number(e.target.value))}
              />
            </div>
            
            <div>
              <Label htmlFor="vendedora">Vendedor (opcional)</Label>
              <Select 
                value={formVendedoraId?.toString() ?? "todos"} 
                onValueChange={(value) => setFormVendedoraId(value === "todos" ? undefined : Number(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {vendedoras.map(v => (
                    <SelectItem key={v.id} value={v.id.toString()}>{v.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="curso">Curso (opcional)</Label>
              <Select 
                value={formCursoId?.toString() ?? "todos"} 
                onValueChange={(value) => setFormCursoId(value === "todos" ? undefined : Number(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {cursos.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.tema}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <p className="text-sm text-muted-foreground">
              💡 Dica: Deixe ambos em "Todos" para criar uma taxa padrão.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTaxaOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddTaxa} className="bg-accent hover:bg-accent/90">
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
