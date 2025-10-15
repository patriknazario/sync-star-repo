import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Curso } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CursoDetailModal } from './CursoDetailModal';
import { ptBR } from 'date-fns/locale';

interface CursoCalendarProps {
  cursos: Curso[];
}

export function CursoCalendar({ cursos }: CursoCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCursos, setSelectedCursos] = useState<Curso[]>([]);

  // Mapear cursos por data
  const cursosPorData = new Map<string, Curso[]>();
  cursos.forEach((curso) => {
    const dataInicio = new Date(curso.dataInicio);
    const dataTermino = new Date(curso.dataTermino);
    
    // Adicionar curso para todas as datas entre início e término
    for (let d = new Date(dataInicio); d <= dataTermino; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split('T')[0];
      if (!cursosPorData.has(key)) {
        cursosPorData.set(key, []);
      }
      cursosPorData.get(key)!.push(curso);
    }
  });

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    const key = date.toISOString().split('T')[0];
    const cursosNaData = cursosPorData.get(key) || [];
    
    if (cursosNaData.length > 0) {
      setSelectedCursos(cursosNaData);
      setSelectedDate(date);
      setModalOpen(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planejado':
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-300';
      case 'Inscrições Abertas':
        return 'bg-green-500/20 text-green-700 dark:text-green-300';
      case 'Em Andamento':
        return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300';
      case 'Concluído':
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
      case 'Cancelado':
        return 'bg-red-500/20 text-red-700 dark:text-red-300';
      default:
        return 'bg-muted';
    }
  };

  const modifiers = {
    hasCurso: (date: Date) => {
      const key = date.toISOString().split('T')[0];
      return cursosPorData.has(key);
    },
  };

  const modifiersClassNames = {
    hasCurso: 'relative font-bold',
  };

  const DayContent = ({ date }: { date: Date }) => {
    const key = date.toISOString().split('T')[0];
    const cursosNoDia = cursosPorData.get(key) || [];
    
    return (
      <div className="relative h-full w-full flex items-center justify-center group cursor-pointer">
        <span className="text-sm font-medium transition-colors group-hover:text-primary">
          {date.getDate()}
        </span>
        
        {cursosNoDia.length > 0 && (
          <>
            <Badge 
              variant="secondary" 
              className={cn(
                "absolute -bottom-1 text-[10px] px-1.5 h-4 pointer-events-none font-semibold transition-transform group-hover:scale-110",
                getStatusColor(cursosNoDia[0].status)
              )}
            >
              {cursosNoDia.length}
            </Badge>
            <div className="absolute inset-0 rounded-md ring-2 ring-primary/20 pointer-events-none" />
          </>
        )}
      </div>
    );
  };

  const handlePreviousMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1));
  };

  return (
    <div className="space-y-4">
      {/* Controles de navegação */}
      <div className="flex items-center justify-between px-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handlePreviousMonth}
          className="hover:bg-primary/10"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h3 className="text-xl font-bold capitalize">
          {selectedMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </h3>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleNextMonth}
          className="hover:bg-primary/10"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Calendário */}
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={handleDateSelect}
        month={selectedMonth}
        onMonthChange={setSelectedMonth}
        locale={ptBR}
        modifiers={modifiers}
        modifiersClassNames={modifiersClassNames}
        components={{
          Day: ({ date }) => DayContent({ date }),
        }}
        className="rounded-lg border-0 w-full pointer-events-auto"
      />

      {/* Legendas */}
      <div className="flex flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1">
          <div className={cn("w-3 h-3 rounded-sm", getStatusColor('Planejado'))} />
          <span>Planejado</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={cn("w-3 h-3 rounded-sm", getStatusColor('Inscrições Abertas'))} />
          <span>Inscrições Abertas</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={cn("w-3 h-3 rounded-sm", getStatusColor('Em Andamento'))} />
          <span>Em Andamento</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={cn("w-3 h-3 rounded-sm", getStatusColor('Concluído'))} />
          <span>Concluído</span>
        </div>
      </div>

      {/* Modal de detalhes */}
      <CursoDetailModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        cursos={selectedCursos}
        data={selectedDate}
      />
    </div>
  );
}
