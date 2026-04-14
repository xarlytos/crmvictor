import { CalendarEvent, EventType } from '@/types';
import { cn } from '@/lib/utils';
import { EventItem } from './EventItem';
import { Plus } from 'lucide-react';

interface CalendarDayProps {
  date: Date;
  events: CalendarEvent[];
  eventTypes: EventType[];
  isCurrentMonth: boolean;
  isToday: boolean;
  onEventClick: (event: CalendarEvent) => void;
  onDayClick: (date: Date) => void;
  onToggleComplete?: (event: CalendarEvent) => void;
}

export function CalendarDay({
  date,
  events,
  eventTypes,
  isCurrentMonth,
  isToday,
  onEventClick,
  onDayClick,
  onToggleComplete,
}: CalendarDayProps) {
  const dateStr = formatDateToString(date);
  const dayEvents = events
    .filter((e) => e.date === dateStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleDayClick = () => {
    onDayClick(date);
  };

  const handleEventClick = (e: React.MouseEvent, event: CalendarEvent) => {
    e.stopPropagation();
    onEventClick(event);
  };

  const handleToggleComplete = (e: React.MouseEvent, event: CalendarEvent) => {
    e.stopPropagation();
    onToggleComplete?.(event);
  };

  const getEventType = (typeId: string) =>
    eventTypes.find((et) => et.id === typeId);

  return (
    <div
      onClick={handleDayClick}
      className={cn(
        'min-h-[120px] p-2 border border-slate-200/60',
        'flex flex-col gap-1',
        'cursor-pointer transition-all duration-200',
        'hover:bg-white/60 hover:shadow-sm',
        !isCurrentMonth && 'bg-slate-50/50 text-slate-400',
        isToday && 'bg-emerald-50/30'
      )}
    >
      {/* Header del día */}
      <div className="flex items-center justify-between mb-1">
        <span
          className={cn(
            'text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full transition-all duration-200',
            isToday
              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/20'
              : 'text-slate-700'
          )}
        >
          {date.getDate()}
        </span>
        {dayEvents.length > 0 && (
          <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {dayEvents.length}
          </span>
        )}
      </div>

      {/* Lista de eventos - SIEMPRE muestra todos, sin límite */}
      <div className="flex flex-col gap-1 flex-1">
        {dayEvents.map((event) => (
          <EventItem
            key={event.id}
            event={event}
            eventType={getEventType(event.typeId)}
            onClick={(e) => handleEventClick(e, event)}
            onToggleComplete={(e) => handleToggleComplete(e, event)}
          />
        ))}
      </div>

      {/* Estado vacío sutil con botón de añadir al hover */}
      {dayEvents.length === 0 && (
        <div className="flex-1 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
            <Plus className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      )}
    </div>
  );
}

function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
