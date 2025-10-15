import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Curso } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CursoDetailModal } from './CursoDetailModal';

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

  const DayContent = (date: Date) => {
    const key = date.toISOString().split('T')[0];
    const cursosNoDia = cursosPorData.get(key) || [];
    
    if (cursosNoDia.length === 0) return null;

    // Mostrar apenas o status do primeiro curso para não poluir
    const primeiroStatus = cursosNoDia[0].status;

    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        <span className="relative z-10">{date.getDate()}</span>
        <Badge 
          variant="secondary" 
          className={cn(
            "absolute bottom-0 text-[8px] px-1 h-3 pointer-events-none",
            getStatusColor(primeiroStatus)
          )}
        >
          {cursosNoDia.length}
        </Badge>
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
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold">
          {selectedMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </h3>
        <Button variant="outline" size="sm" onClick={handleNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendário */}
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={handleDateSelect}
        month={selectedMonth}
        onMonthChange={setSelectedMonth}
        modifiers={modifiers}
        modifiersClassNames={modifiersClassNames}
        components={{
          Day: ({ date }) => DayContent(date),
        }}
        className="rounded-md border"
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
