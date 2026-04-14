import { CalendarEvent, EventType } from '@/types';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface EventItemProps {
  event: CalendarEvent;
  eventType?: EventType;
  onClick?: (e: React.MouseEvent) => void;
  onToggleComplete?: (e: React.MouseEvent) => void;
}

export function EventItem({ event, eventType, onClick, onToggleComplete }: EventItemProps) {
  const color = event.customColor || eventType?.color || '#6b7280';
  const isCompleted = !!event.completed;

  return (
    <div
      className={cn(
        'w-full text-left rounded-lg px-2 py-1.5 text-xs',
        'transition-all duration-200 ease-out',
        'border-l-[3px] flex items-center gap-1.5',
        isCompleted ? 'opacity-60' : 'hover:shadow-md hover:scale-[1.02]'
      )}
      style={{
        backgroundColor: `${color}20`,
        borderLeftColor: color,
      }}
      title={`${event.title} (${event.startTime} - ${event.endTime})`}
    >
      {/* Botón de completado */}
      <button
        onClick={onToggleComplete}
        className={cn(
          'shrink-0 w-4 h-4 rounded-full border flex items-center justify-center transition-colors',
          isCompleted
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'border-slate-300 hover:border-emerald-400 bg-white/60'
        )}
        title={isCompleted ? 'Marcar como pendiente' : 'Marcar como completado'}
      >
        {isCompleted && <Check className="w-2.5 h-2.5" />}
      </button>

      {/* Contenido clickeable */}
      <button
        onClick={onClick}
        className={cn(
          'flex-1 min-w-0 text-left',
          'focus:outline-none focus:ring-2 focus:ring-offset-1 rounded'
        )}
        style={{ '--tw-ring-color': color } as React.CSSProperties}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className="font-bold shrink-0 text-[10px] px-1 py-0.5 rounded"
            style={{ color, backgroundColor: `${color}15` }}
          >
            {event.startTime}
          </span>
          <span
            className={cn(
              'truncate font-semibold',
              isCompleted ? 'text-slate-500 line-through' : 'text-slate-700'
            )}
          >
            {event.title}
          </span>
        </div>
      </button>
    </div>
  );
}
