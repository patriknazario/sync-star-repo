export interface Vendedora {
  id: number;
  nome: string;
  metaMensal: number;
  metaAnual: number;
}

export interface Professor {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  areas: string[];
  redesSociais: {
    linkedin?: string;
    instagram?: string;
    site?: string;
  };
  bio: string;
  foto?: string;
}

export interface Curso {
  id: number;
  tema: string;
  professorId: number;
  cidade: string;
  estado: string;
  dataInicio: string;
  dataTermino: string;
  cargaHoraria: number;
  valorInscricao: number;
  descricao: string;
  status: 'Planejado' | 'Inscrições Abertas' | 'Em Andamento' | 'Concluído' | 'Cancelado';
  inscricoes: number;
}

export interface Lead {
  id: number;
  cursoId: number;
  nomeResponsavel: string;
  orgao: string;
  setor: string;
  cidade: string;
  estado: string;
  telefone: string;
  email: string;
  quantidadeInscricoes: number;
  valorProposta: number;
  vendedoraId: number;
  status: 'Proposta Enviada' | 'Inscrição Realizada' | 'Proposta Declinada';
  dataCadastro: string;
  dataConversao?: string;
  motivoPerda?: 'Preço' | 'Data do curso incompatível' | 'Sem orçamento';
  observacoes?: string;
}

export interface Cliente {
  id: number;
  orgao: string;
  cidade: string;
  estado: string;
  contatos: {
    nome: string;
    cargo: string;
    telefone: string;
    email: string;
  }[];
  historicoCursos: {
    cursoId: number;
    data: string;
    valor: number;
  }[];
  totalGasto: number;
  ultimaCompra: string;
  recorrente: boolean;
}

export const vendedoras: Vendedora[] = [
  { id: 1, nome: "Ana Silva", metaMensal: 50000, metaAnual: 600000 },
  { id: 2, nome: "Beatriz Costa", metaMensal: 45000, metaAnual: 540000 },
  { id: 3, nome: "Carla Mendes", metaMensal: 48000, metaAnual: 576000 },
  { id: 4, nome: "Diana Oliveira", metaMensal: 42000, metaAnual: 504000 },
  { id: 5, nome: "Eduarda Santos", metaMensal: 46000, metaAnual: 552000 },
  { id: 6, nome: "Fernanda Lima", metaMensal: 44000, metaAnual: 528000 },
  { id: 7, nome: "Gabriela Rocha", metaMensal: 47000, metaAnual: 564000 },
  { id: 8, nome: "Helena Martins", metaMensal: 43000, metaAnual: 516000 },
  { id: 9, nome: "Isabela Ferreira", metaMensal: 45000, metaAnual: 540000 },
  { id: 10, nome: "Juliana Alves", metaMensal: 49000, metaAnual: 588000 },
];

export const professores: Professor[] = [
  {
    id: 1,
    nome: "Dr. Roberto Andrade",
    email: "roberto.andrade@cgp.edu.br",
    telefone: "(11) 98765-4321",
    areas: ["Gestão Pública", "Licitações", "Contratos"],
    redesSociais: {
      linkedin: "linkedin.com/in/robertoandrade",
      instagram: "@prof.roberto"
    },
    bio: "Especialista em licitações públicas com 15 anos de experiência em gestão governamental"
  },
  {
    id: 2,
    nome: "Dra. Mariana Souza",
    email: "mariana.souza@cgp.edu.br",
    telefone: "(21) 97654-3210",
    areas: ["Gestão de Pessoas", "RH", "Desenvolvimento Organizacional"],
    redesSociais: {
      linkedin: "linkedin.com/in/marianasouza",
      site: "marianasouza.com.br"
    },
    bio: "Doutora em Administração Pública, especialista em gestão de pessoas no setor público"
  },
  {
    id: 3,
    nome: "Prof. Carlos Mendes",
    email: "carlos.mendes@cgp.edu.br",
    telefone: "(61) 99876-5432",
    areas: ["Finanças Públicas", "Orçamento", "Controladoria"],
    redesSociais: {
      linkedin: "linkedin.com/in/carlosmendes"
    },
    bio: "Contador público com especialização em finanças governamentais e controle orçamentário"
  },
  {
    id: 4,
    nome: "Dra. Patricia Lima",
    email: "patricia.lima@cgp.edu.br",
    telefone: "(85) 98765-1234",
    areas: ["Planejamento Estratégico", "Gestão de Projetos"],
    redesSociais: {
      linkedin: "linkedin.com/in/patricialima",
      instagram: "@dra.patricia"
    },
    bio: "Especialista em planejamento estratégico e gestão de projetos públicos"
  },
  {
    id: 5,
    nome: "Prof. Fernando Costa",
    email: "fernando.costa@cgp.edu.br",
    telefone: "(71) 97654-8765",
    areas: ["Direito Administrativo", "Legislação", "Compliance"],
    redesSociais: {
      linkedin: "linkedin.com/in/fernandocosta"
    },
    bio: "Advogado especialista em direito administrativo e compliance no setor público"
  }
];

export const cursos: Curso[] = [
  {
    id: 1,
    tema: "Licitações e Contratos Administrativos",
    professorId: 1,
    cidade: "São Paulo",
    estado: "SP",
    dataInicio: "2025-11-15",
    dataTermino: "2025-11-17",
    cargaHoraria: 24,
    valorInscricao: 1200,
    descricao: "Curso completo sobre o processo licitatório e gestão de contratos públicos",
    status: "Inscrições Abertas",
    inscricoes: 18
  },
  {
    id: 2,
    tema: "Gestão de Pessoas no Setor Público",
    professorId: 2,
    cidade: "Brasília",
    estado: "DF",
    dataInicio: "2025-10-20",
    dataTermino: "2025-10-22",
    cargaHoraria: 20,
    valorInscricao: 980,
    descricao: "Estratégias modernas de gestão de pessoas aplicadas ao setor público",
    status: "Inscrições Abertas",
    inscricoes: 12
  },
  {
    id: 3,
    tema: "Planejamento e Orçamento Público",
    professorId: 3,
    cidade: "Rio de Janeiro",
    estado: "RJ",
    dataInicio: "2025-11-25",
    dataTermino: "2025-11-27",
    cargaHoraria: 24,
    valorInscricao: 1150,
    descricao: "Elaboração e gestão do orçamento público com foco em eficiência",
    status: "Inscrições Abertas",
    inscricoes: 22
  },
  {
    id: 4,
    tema: "Compliance e Ética na Administração Pública",
    professorId: 5,
    cidade: "Fortaleza",
    estado: "CE",
    dataInicio: "2025-12-05",
    dataTermino: "2025-12-07",
    cargaHoraria: 20,
    valorInscricao: 1050,
    descricao: "Programas de integridade e compliance aplicados ao setor público",
    status: "Planejado",
    inscricoes: 0
  },
  {
    id: 5,
    tema: "Gestão Estratégica de Projetos Públicos",
    professorId: 4,
    cidade: "Salvador",
    estado: "BA",
    dataInicio: "2025-10-15",
    dataTermino: "2025-10-17",
    cargaHoraria: 24,
    valorInscricao: 1180,
    descricao: "Metodologias ágeis e tradicionais aplicadas a projetos governamentais",
    status: "Em Andamento",
    inscricoes: 25
  },
  {
    id: 6,
    tema: "Controladoria e Auditoria Pública",
    professorId: 3,
    cidade: "Belo Horizonte",
    estado: "MG",
    dataInicio: "2025-09-10",
    dataTermino: "2025-09-12",
    cargaHoraria: 20,
    valorInscricao: 1100,
    descricao: "Técnicas de auditoria e controladoria para gestores públicos",
    status: "Concluído",
    inscricoes: 30
  }
];

export const leads: Lead[] = [
  {
    id: 1,
    cursoId: 1,
    nomeResponsavel: "João Pereira",
    orgao: "Prefeitura Municipal de Campinas",
    setor: "Secretaria de Finanças",
    cidade: "Campinas",
    estado: "SP",
    telefone: "(19) 3234-5678",
    email: "joao.pereira@campinas.sp.gov.br",
    quantidadeInscricoes: 3,
    valorProposta: 3600,
    vendedoraId: 1,
    status: "Proposta Enviada",
    dataCadastro: "2025-09-15"
  },
  {
    id: 2,
    cursoId: 1,
    nomeResponsavel: "Maria Santos",
    orgao: "Secretaria de Educação do Estado de SP",
    setor: "Recursos Humanos",
    cidade: "São Paulo",
    estado: "SP",
    telefone: "(11) 3456-7890",
    email: "maria.santos@educacao.sp.gov.br",
    quantidadeInscricoes: 5,
    valorProposta: 6000,
    vendedoraId: 2,
    status: "Inscrição Realizada",
    dataCadastro: "2025-09-10",
    dataConversao: "2025-09-20"
  },
  {
    id: 3,
    cursoId: 2,
    nomeResponsavel: "Carlos Oliveira",
    orgao: "Tribunal de Contas da União",
    setor: "Auditoria",
    cidade: "Brasília",
    estado: "DF",
    telefone: "(61) 3321-9876",
    email: "carlos@tcu.gov.br",
    quantidadeInscricoes: 2,
    valorProposta: 1960,
    vendedoraId: 3,
    status: "Proposta Declinada",
    dataCadastro: "2025-09-05",
    motivoPerda: "Preço"
  },
  {
    id: 4,
    cursoId: 3,
    nomeResponsavel: "Ana Paula Costa",
    orgao: "Governo do Estado do RJ",
    setor: "Planejamento",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    telefone: "(21) 2234-5678",
    email: "ana.costa@rj.gov.br",
    quantidadeInscricoes: 4,
    valorProposta: 4600,
    vendedoraId: 1,
    status: "Inscrição Realizada",
    dataCadastro: "2025-09-12",
    dataConversao: "2025-09-25"
  },
  {
    id: 5,
    cursoId: 3,
    nomeResponsavel: "Roberto Silva",
    orgao: "Câmara Municipal do RJ",
    setor: "Administração",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    telefone: "(21) 3345-6789",
    email: "roberto@camara.rj.gov.br",
    quantidadeInscricoes: 6,
    valorProposta: 6900,
    vendedoraId: 2,
    status: "Proposta Enviada",
    dataCadastro: "2025-09-18"
  }
];

export const clientes: Cliente[] = [
  {
    id: 1,
    orgao: "Prefeitura Municipal de Campinas",
    cidade: "Campinas",
    estado: "SP",
    contatos: [
      {
        nome: "João Pereira",
        cargo: "Diretor de Finanças",
        telefone: "(19) 3234-5678",
        email: "joao@campinas.gov.br"
      }
    ],
    historicoCursos: [
      { cursoId: 1, data: "2024-03-10", valor: 3600 },
      { cursoId: 6, data: "2024-08-15", valor: 4400 }
    ],
    totalGasto: 8000,
    ultimaCompra: "2024-08-15",
    recorrente: true
  }
];

export const metaTotalAnual = 5500000;
