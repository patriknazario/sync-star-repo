import { useParams, useNavigate } from 'react-router-dom';
import { useCursos } from '@/hooks/useCursos';
import { useLeads } from '@/hooks/useLeads';
import { useProfessores } from '@/hooks/useProfessores';
import { KPICard } from '@/components/common/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Users, DollarSign, TrendingUp, Calendar, MapPin, Clock } from 'lucide-react';
import { formatCurrency, getInscricoesCurso, getFaturamentoCurso } from '@/utils/calculations';
import { StatusBadge } from '@/components/common/StatusBadge';

export default function DetalheCurso() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cursos, isLoading: cursosLoading } = useCursos();
  const { leads, isLoading: leadsLoading } = useLeads();
  const { professores } = useProfessores();

  const curso = cursos.find(c => c.id === id);
  const professor = curso ? professores.find(p => p.id === curso.professor_id) : null;
  const leadsVinculados = leads.filter(l => l.curso_id === id);
  const inscricoes = curso ? getInscricoesCurso(leads, curso.id) : 0;
  const faturamento = curso ? getFaturamentoCurso(leads, curso.id) : 0;

  if (cursosLoading || leadsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Carregando curso...</p>
      </div>
    );
  }

  if (!curso) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">Curso não encontrado</p>
          <Button onClick={() => navigate('/cursos')}>Voltar para Cursos</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/cursos')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-foreground mb-2">{curso.tema}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {curso.cidade}, {curso.estado}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {curso.data_inicio} a {curso.data_termino}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {curso.carga_horaria}h
              </span>
            </div>
          </div>
          <StatusBadge status={curso.status} />
          <Button onClick={() => navigate('/cursos')}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <KPICard
            title="Total de Leads"
            value={leadsVinculados.length.toString()}
            icon={Users}
          />
          <KPICard
            title="Inscrições Confirmadas"
            value={inscricoes.toString()}
            icon={TrendingUp}
            variant="accent"
          />
          <KPICard
            title="Faturamento"
            value={formatCurrency(faturamento)}
            icon={DollarSign}
            variant="success"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações do Curso */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Curso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {curso.descricao && (
                  <div>
                    <h3 className="font-medium mb-2">Descrição</h3>
                    <p className="text-muted-foreground">{curso.descricao}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-1">Valor da Inscrição</h3>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(curso.valor_inscricao)}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Carga Horária</h3>
                    <p className="text-2xl font-bold">{curso.carga_horaria}h</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leads Vinculados */}
            <Card>
              <CardHeader>
                <CardTitle>Leads Vinculados ({leadsVinculados.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {leadsVinculados.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum lead vinculado a este curso
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Órgão</TableHead>
                        <TableHead>Responsável</TableHead>
                        <TableHead>Cidade/Estado</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Inscrições</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leadsVinculados.map(lead => (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">{lead.orgao}</TableCell>
                          <TableCell>{lead.nome_responsavel}</TableCell>
                          <TableCell>{lead.cidade}/{lead.estado}</TableCell>
                          <TableCell>
                            <Badge variant={lead.status === 'Inscrição Realizada' ? 'default' : 'outline'}>
                              {lead.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{lead.quantidade_inscricoes}</TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(lead.valor_negociado ?? lead.valor_proposta)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Professor */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Professor</CardTitle>
              </CardHeader>
              <CardContent>
                {professor ? (
                  <div className="space-y-4">
                    {professor.foto && (
                      <img
                        src={professor.foto}
                        alt={professor.nome}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h3 className="font-bold text-lg">{professor.nome}</h3>
                      <p className="text-sm text-muted-foreground">{professor.email}</p>
                      {professor.telefone && (
                        <p className="text-sm text-muted-foreground">{professor.telefone}</p>
                      )}
                    </div>
                    {professor.bio && (
                      <p className="text-sm">{professor.bio}</p>
                    )}
                    {professor.areas && professor.areas.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {professor.areas.map((area, i) => (
                          <Badge key={i} variant="secondary">{area}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Professor não atribuído</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
