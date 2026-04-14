import { useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarEvent, EventType } from '@/types';
import { CalendarDay } from './CalendarDay';

interface CalendarMonthProps {
  currentDate: Date;
  events: CalendarEvent[];
  eventTypes: EventType[];
  onEventClick: (event: CalendarEvent) => void;
  onDayClick: (date: Date) => void;
  onToggleComplete?: (event: CalendarEvent) => void;
}

const WEEK_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export function CalendarMonth({
  currentDate,
  events,
  eventTypes,
  onEventClick,
  onDayClick,
  onToggleComplete,
}: CalendarMonthProps) {
  const { days, monthStart } = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Lunes
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd,
    });

    return { days, monthStart };
  }, [currentDate]);

  const today = new Date();

  // Agrupar días por semanas para el grid
  const weeks = useMemo(() => {
    const result: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    return result;
  }, [days]);

  return (
    <div className="flex flex-col h-full glass-card overflow-hidden">
      {/* Header de días de la semana */}
      <div className="grid grid-cols-7 bg-gradient-to-r from-slate-50/80 to-slate-100/50 border-b border-slate-200/60">
        {WEEK_DAYS.map((day) => (
          <div
            key={day}
            className="py-3 px-3 text-center text-sm font-bold text-slate-500 uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid del calendario */}
      <div className="flex-1 flex flex-col bg-white/30">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 flex-1">
            {week.map((day) => (
              <CalendarDay
                key={day.toISOString()}
                date={day}
                events={events}
                eventTypes={eventTypes}
                isCurrentMonth={isSameMonth(day, monthStart)}
                isToday={isSameDay(day, today)}
                onEventClick={onEventClick}
                onDayClick={onDayClick}
                onToggleComplete={onToggleComplete}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente de navegación del mes
interface MonthNavigatorProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export function MonthNavigator({
  currentDate,
  onPreviousMonth,
  onNextMonth,
  onToday,
}: MonthNavigatorProps) {
  return (
    <div className="flex items-center justify-between p-5 glass-card mb-5">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-extrabold text-slate-800 capitalize min-w-[220px]">
          {format(currentDate, 'MMMM yyyy', { locale: es })}
        </h2>
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
          <button
            onClick={onPreviousMonth}
            className="p-2 hover:bg-white rounded-lg transition-all duration-200 shadow-sm hover:shadow"
            title="Mes anterior"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-slate-600"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={onNextMonth}
            className="p-2 hover:bg-white rounded-lg transition-all duration-200 shadow-sm hover:shadow"
            title="Mes siguiente"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-slate-600"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <button
        onClick={onToday}
        className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300"
      >
        Hoy
      </button>
    </div>
  );
}
