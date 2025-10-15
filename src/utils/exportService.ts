import * as XLSX from 'xlsx';
import { Curso, Lead, Vendedora } from '@/data/mockData';
import { formatCurrency, formatDate } from './calculations';

// ========== PERFORMANCE DE VENDAS ==========
export const exportPerformanceVendas = (
  vendedoras: Vendedora[],
  leads: Lead[],
  cursos: Curso[]
) => {
  const dados = vendedoras.map((vendedora) => {
    const leadsVendedora = leads.filter((l) => l.vendedoraId === vendedora.id);
    const leadsConvertidos = leadsVendedora.filter((l) => l.status === 'Inscrição Realizada');
    const faturamento = leadsConvertidos.reduce(
      (sum, l) => sum + (l.valorNegociado ?? l.valorProposta),
      0
    );
    const inscricoes = leadsConvertidos.reduce((sum, l) => sum + l.quantidadeInscricoes, 0);
    const taxaConversao = leadsVendedora.length > 0 
      ? ((leadsConvertidos.length / leadsVendedora.length) * 100).toFixed(1) + '%'
      : '0%';
    const comissao = faturamento * 0.05;

    return {
      Vendedora: vendedora.nome,
      'Total Leads': leadsVendedora.length,
      'Leads Convertidos': leadsConvertidos.length,
      'Taxa de Conversão': taxaConversao,
      'Inscrições Realizadas': inscricoes,
      'Faturamento': formatCurrency(faturamento),
      'Comissão (5%)': formatCurrency(comissao),
      'Meta Anual': formatCurrency(vendedora.metaAnual),
      '% da Meta': ((faturamento / vendedora.metaAnual) * 100).toFixed(1) + '%',
    };
  });

  const ws = XLSX.utils.json_to_sheet(dados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Performance de Vendas');

  // Auto-ajustar largura das colunas
  const maxWidth = dados.reduce((w, r) => Math.max(w, r.Vendedora.length), 10);
  ws['!cols'] = [
    { wch: maxWidth },
    { wch: 12 },
    { wch: 16 },
    { wch: 18 },
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
  ];

  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Relatorio_Performance_Vendas_${timestamp}.xlsx`);
};

// ========== ANÁLISE POR REGIÃO ==========
export const exportAnaliseRegiao = (cursos: Curso[], leads: Lead[]) => {
  const regioes = new Map<string, { cursos: number; inscricoes: number; faturamento: number }>();

  cursos.forEach((curso) => {
    const key = `${curso.cidade} - ${curso.estado}`;
    const inscricoes = leads
      .filter((l) => l.cursoId === curso.id && l.status === 'Inscrição Realizada')
      .reduce((sum, l) => sum + l.quantidadeInscricoes, 0);
    const faturamento = leads
      .filter((l) => l.cursoId === curso.id && l.status === 'Inscrição Realizada')
      .reduce((sum, l) => sum + (l.valorNegociado ?? l.valorProposta), 0);

    if (regioes.has(key)) {
      const existing = regioes.get(key)!;
      regioes.set(key, {
        cursos: existing.cursos + 1,
        inscricoes: existing.inscricoes + inscricoes,
        faturamento: existing.faturamento + faturamento,
      });
    } else {
      regioes.set(key, { cursos: 1, inscricoes, faturamento });
    }
  });

  const dados = Array.from(regioes.entries()).map(([regiao, stats]) => ({
    'Cidade/Estado': regiao,
    'Qtd. Cursos': stats.cursos,
    'Total Inscrições': stats.inscricoes,
    'Faturamento Total': formatCurrency(stats.faturamento),
    'Ticket Médio': formatCurrency(stats.faturamento / (stats.inscricoes || 1)),
  }));

  const ws = XLSX.utils.json_to_sheet(dados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Análise Regional');

  ws['!cols'] = [{ wch: 25 }, { wch: 12 }, { wch: 16 }, { wch: 18 }, { wch: 15 }];

  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Relatorio_Analise_Regional_${timestamp}.xlsx`);
};

// ========== ANÁLISE POR CURSO ==========
export const exportAnaliseCurso = (cursos: Curso[], leads: Lead[]) => {
  const dados = cursos.map((curso) => {
    const inscricoes = leads
      .filter((l) => l.cursoId === curso.id && l.status === 'Inscrição Realizada')
      .reduce((sum, l) => sum + l.quantidadeInscricoes, 0);
    const faturamento = leads
      .filter((l) => l.cursoId === curso.id && l.status === 'Inscrição Realizada')
      .reduce((sum, l) => sum + (l.valorNegociado ?? l.valorProposta), 0);
    const totalLeads = leads.filter((l) => l.cursoId === curso.id).length;

    return {
      Curso: curso.tema,
      Local: `${curso.cidade}, ${curso.estado}`,
      'Data Início': formatDate(curso.dataInicio),
      'Data Término': formatDate(curso.dataTermino),
      Status: curso.status,
      'Inscrições Realizadas': inscricoes,
      'Meta Inscrições': (curso as any).meta_inscricoes || 0,
      '% da Meta': (curso as any).meta_inscricoes 
        ? ((inscricoes / (curso as any).meta_inscricoes) * 100).toFixed(1) + '%'
        : '0%',
      'Total Leads': totalLeads,
      'Faturamento': formatCurrency(faturamento),
      'Ticket Médio': inscricoes > 0 ? formatCurrency(faturamento / inscricoes) : 'R$ 0',
    };
  });

  const ws = XLSX.utils.json_to_sheet(dados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Análise por Curso');

  ws['!cols'] = [
    { wch: 35 },
    { wch: 20 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
    { wch: 18 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
    { wch: 15 },
  ];

  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Relatorio_Analise_Cursos_${timestamp}.xlsx`);
};

// ========== COMISSÕES ==========
export const exportComissoes = (vendedoras: Vendedora[], leads: Lead[], cursos: Curso[]) => {
  const dados: any[] = [];

  vendedoras.forEach((vendedora) => {
    const leadsVendedora = leads.filter(
      (l) => l.vendedoraId === vendedora.id && l.status === 'Inscrição Realizada'
    );

    leadsVendedora.forEach((lead) => {
      const curso = cursos.find((c) => c.id === lead.cursoId);
      const faturamento = lead.valorNegociado ?? lead.valorProposta;
      const comissao = faturamento * 0.05;

      dados.push({
        Vendedora: vendedora.nome,
        Curso: curso?.tema || 'N/A',
        'Data Conversão': lead.dataConversao ? formatDate(lead.dataConversao) : 'N/A',
        Cliente: lead.orgao,
        'Qtd. Inscrições': lead.quantidadeInscricoes,
        Faturamento: formatCurrency(faturamento),
        'Comissão (5%)': formatCurrency(comissao),
      });
    });
  });

  // Adicionar totalizadores
  const totalFaturamento = dados.reduce((sum, d) => {
    const valor = parseFloat(d.Faturamento.replace(/[R$\s.]/g, '').replace(',', '.'));
    return sum + valor;
  }, 0);
  const totalComissao = totalFaturamento * 0.05;

  dados.push({
    Vendedora: 'TOTAL',
    Curso: '',
    'Data Conversão': '',
    Cliente: '',
    'Qtd. Inscrições': '',
    Faturamento: formatCurrency(totalFaturamento),
    'Comissão (5%)': formatCurrency(totalComissao),
  });

  const ws = XLSX.utils.json_to_sheet(dados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Comissões');

  ws['!cols'] = [
    { wch: 15 },
    { wch: 35 },
    { wch: 15 },
    { wch: 30 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
  ];

  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Relatorio_Comissoes_${timestamp}.xlsx`);
};

// ========== PIPELINE DE RECEITA ==========
export const exportPipeline = (leads: Lead[], cursos: Curso[], vendedoras: Vendedora[]) => {
  const leadsAbertos = leads.filter((l) => l.status === 'Proposta Enviada');

  const dados = leadsAbertos.map((lead) => {
    const curso = cursos.find((c) => c.id === lead.cursoId);
    const vendedora = vendedoras.find((v) => v.id === lead.vendedoraId);
    const receitaPotencial = lead.valorNegociado ?? lead.valorProposta;

    return {
      Curso: curso?.tema || 'N/A',
      'Data do Curso': curso ? formatDate(curso.dataInicio) : 'N/A',
      Cliente: lead.orgao,
      'Cidade/Estado': `${lead.cidade}, ${lead.estado}`,
      Vendedora: vendedora?.nome || 'N/A',
      'Qtd. Inscrições': lead.quantidadeInscricoes,
      'Valor Proposta': formatCurrency(lead.valorProposta),
      'Valor Negociado': lead.valorNegociado ? formatCurrency(lead.valorNegociado) : 'Em negociação',
      'Receita Potencial': formatCurrency(receitaPotencial),
      'Data Cadastro': formatDate(lead.dataCadastro),
    };
  });

  // Adicionar totalizador
  const totalPotencial = leadsAbertos.reduce(
    (sum, l) => sum + (l.valorNegociado ?? l.valorProposta),
    0
  );

  dados.push({
    Curso: 'TOTAL PIPELINE',
    'Data do Curso': '',
    Cliente: '',
    'Cidade/Estado': '',
    Vendedora: '',
    'Qtd. Inscrições': leadsAbertos.reduce((sum, l) => sum + l.quantidadeInscricoes, 0),
    'Valor Proposta': '',
    'Valor Negociado': '',
    'Receita Potencial': formatCurrency(totalPotencial),
    'Data Cadastro': '',
  });

  const ws = XLSX.utils.json_to_sheet(dados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Pipeline de Receita');

  ws['!cols'] = [
    { wch: 35 },
    { wch: 15 },
    { wch: 30 },
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 18 },
    { wch: 18 },
    { wch: 15 },
  ];

  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Relatorio_Pipeline_Receita_${timestamp}.xlsx`);
};
