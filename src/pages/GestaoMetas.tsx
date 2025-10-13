import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useMetasGlobais } from '@/hooks/useMetasGlobais';
import { useVendedoras } from '@/hooks/useVendedoras';
import { useTaxasComissao } from '@/hooks/useTaxasComissao';
import { useLeads } from '@/hooks/useLeads';
import { useCursos } from '@/hooks/useCursos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, TrendingUp, Edit, Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/utils/calculations';
import { Badge } from '@/components/ui/badge';

export default function GestaoMetas() {
  const { anoSelecionado } = useApp();
  const { metasGlobais, updateMetaGlobal, addMetaGlobal } = useMetasGlobais();
  const { vendedoras, updateVendedora } = useVendedoras();
  const { taxasComissao, addTaxaComissao, deleteTaxaComissao } = useTaxasComissao();
  const { leads } = useLeads();
  const { cursos } = useCursos();
  const [editingMeta, setEditingMeta] = useState(false);
  const [novaMetaValor, setNovaMetaValor] = useState('');
  const [taxaDialog, setTaxaDialog] = useState(false);
  const [novaTaxa, setNovaTaxa] = useState({
    taxa: 0,
    vendedora_id: '',
    curso_id: '',
    tipo: 'Padrão' as 'Padrão' | 'Específica'
  });

  const metaGlobal = metasGlobais.find(m => m.ano === anoSelecionado);
  const realizado = leads
    .filter(l => l.status === 'Inscrição Realizada' && l.data_conversao)
    .reduce((sum, l) => sum + (l.valor_negociado ?? l.valor_proposta), 0);

  const handleUpdateMetaGlobal = async () => {
    if (!metaGlobal) return;
    await updateMetaGlobal({
      id: metaGlobal.id,
      valor: parseFloat(novaMetaValor)
    });
    setEditingMeta(false);
  };

  const calcRealizadoVendedora = (vendedoraId: string) => {
    return leads
      .filter(l => l.vendedora_id === vendedoraId && l.status === 'Inscrição Realizada')
      .reduce((sum, l) => sum + (l.valor_negociado ?? l.valor_proposta), 0);
  };

  const handleAddTaxa = async () => {
    await addTaxaComissao({
      taxa: novaTaxa.taxa,
      vendedora_id: novaTaxa.vendedora_id || null,
      curso_id: novaTaxa.curso_id || null,
      tipo: novaTaxa.tipo
    });
    setTaxaDialog(false);
    setNovaTaxa({ taxa: 0, vendedora_id: '', curso_id: '', tipo: 'Padrão' });
  };

  const getTaxaLabel = (taxa: any) => {
    if (!taxa.vendedora_id && !taxa.curso_id) return '🌐 Padrão Geral';
    if (taxa.vendedora_id && taxa.curso_id) {
      const vendedora = vendedoras.find(v => v.id === taxa.vendedora_id);
      const curso = cursos.find(c => c.id === taxa.curso_id);
      return `🎯 ${vendedora?.nome} → ${curso?.tema}`;
    }
    if (taxa.vendedora_id) {
      const vendedora = vendedoras.find(v => v.id === taxa.vendedora_id);
      return `👤 ${vendedora?.nome}`;
    }
    if (taxa.curso_id) {
      const curso = cursos.find(c => c.id === taxa.curso_id);
      return `📚 ${curso?.tema}`;
    }
    return '-';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Gestão de Metas</h1>
          <p className="text-muted-foreground">Configure metas e comissões</p>
        </div>

        {/* Meta Global */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Meta Anual {anoSelecionado}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {editingMeta ? (
                <>
                  <Input
                    type="number"
                    value={novaMetaValor}
                    onChange={e => setNovaMetaValor(e.target.value)}
                    className="max-w-xs"
                  />
                  <Button onClick={handleUpdateMetaGlobal}>Salvar</Button>
                  <Button variant="outline" onClick={() => setEditingMeta(false)}>Cancelar</Button>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <span className="text-2xl font-bold">{formatCurrency(realizado)}</span>
                      <span className="text-muted-foreground">{formatCurrency(metaGlobal?.valor ?? 0)}</span>
                    </div>
                    <Progress value={metaGlobal?.valor ? (realizado / metaGlobal.valor) * 100 : 0} className="h-3" />
                    <p className="text-sm text-muted-foreground mt-2">
                      {metaGlobal?.valor ? Math.round((realizado / metaGlobal.valor) * 100) : 0}% atingido
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setNovaMetaValor(metaGlobal?.valor?.toString() ?? '0');
                      setEditingMeta(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Metas de Vendedoras */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Metas por Vendedora
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendedora</TableHead>
                  <TableHead className="text-right">Meta Mensal</TableHead>
                  <TableHead className="text-right">Meta Anual</TableHead>
                  <TableHead className="text-right">Realizado</TableHead>
                  <TableHead>Progresso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendedoras.map(vendedora => {
                  const realizado = calcRealizadoVendedora(vendedora.id);
                  const percentual = vendedora.meta_anual > 0 ? (realizado / vendedora.meta_anual) * 100 : 0;
                  
                  return (
                    <TableRow key={vendedora.id}>
                      <TableCell className="font-medium">{vendedora.nome}</TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          className="w-32 ml-auto"
                          value={vendedora.meta_mensal}
                          onChange={e => updateVendedora({
                            id: vendedora.id,
                            meta_mensal: parseFloat(e.target.value)
                          })}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          className="w-32 ml-auto"
                          value={vendedora.meta_anual}
                          onChange={e => updateVendedora({
                            id: vendedora.id,
                            meta_anual: parseFloat(e.target.value)
                          })}
                        />
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(realizado)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress value={Math.min(percentual, 100)} className="h-2" />
                          <p className="text-xs text-right">{percentual.toFixed(0)}%</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Taxas de Comissão */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Taxas de Comissão</CardTitle>
              <Dialog open={taxaDialog} onOpenChange={setTaxaDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Taxa
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nova Taxa de Comissão</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Taxa (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={novaTaxa.taxa}
                        onChange={e => setNovaTaxa({ ...novaTaxa, taxa: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Vendedora (opcional)</Label>
                      <Select value={novaTaxa.vendedora_id} onValueChange={v => setNovaTaxa({ ...novaTaxa, vendedora_id: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todas</SelectItem>
                          {vendedoras.map(v => (
                            <SelectItem key={v.id} value={v.id}>{v.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Curso (opcional)</Label>
                      <Select value={novaTaxa.curso_id} onValueChange={v => setNovaTaxa({ ...novaTaxa, curso_id: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todos</SelectItem>
                          {cursos.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.tema}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAddTaxa} className="w-full">Criar</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo / Aplicação</TableHead>
                  <TableHead className="text-right">Taxa</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taxasComissao.map(taxa => (
                  <TableRow key={taxa.id}>
                    <TableCell>{getTaxaLabel(taxa)}</TableCell>
                    <TableCell className="text-right font-bold">{taxa.taxa}%</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteTaxaComissao(taxa.id)}
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
      </div>
    </div>
  );
}
