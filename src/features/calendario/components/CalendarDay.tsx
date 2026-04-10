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
}

export function CalendarDay({
  date,
  events,
  eventTypes,
  isCurrentMonth,
  isToday,
  onEventClick,
  onDayClick,
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

  const getEventType = (typeId: string) =>
    eventTypes.find((et) => et.id === typeId);

  return (
    <div
      onClick={handleDayClick}
      className={cn(
        'min-h-[120px] p-2 border border-border',
        'flex flex-col gap-1',
        'cursor-pointer transition-colors duration-150',
        'hover:bg-accent/50',
        !isCurrentMonth && 'bg-muted/30 text-muted-foreground',
        isToday && 'bg-primary/5'
      )}
    >
      {/* Header del día */}
      <div className="flex items-center justify-between mb-1">
        <span
          className={cn(
            'text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full',
            isToday
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground'
          )}
        >
          {date.getDate()}
        </span>
        {dayEvents.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {dayEvents.length} evento{dayEvents.length !== 1 ? 's' : ''}
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
          />
        ))}
      </div>

      {/* Estado vacío sutil con botón de añadir al hover */}
      {dayEvents.length === 0 && (
        <div className="flex-1 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <Plus className="w-4 h-4 text-muted-foreground/50" />
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
