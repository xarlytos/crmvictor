import { CalendarEvent, EventType } from '@/types';
import { cn } from '@/lib/utils';

interface EventItemProps {
  event: CalendarEvent;
  eventType?: EventType;
  onClick?: (e: React.MouseEvent) => void;
}

export function EventItem({ event, eventType, onClick }: EventItemProps) {
  const color = event.customColor || eventType?.color || '#6b7280';

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-lg px-2.5 py-1.5 text-xs',
        'transition-all duration-200 ease-out',
        'hover:shadow-md hover:scale-[1.02]',
        'focus:outline-none focus:ring-2 focus:ring-offset-1'
      )}
      style={{
        backgroundColor: `${color}20`, // 12% opacidad
        borderLeft: `3px solid ${color}`,
        '--tw-ring-color': color,
      } as React.CSSProperties}
      title={`${event.title} (${event.startTime} - ${event.endTime})`}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <span
          className="font-bold shrink-0 text-[10px] px-1.5 py-0.5 rounded"
          style={{ color, backgroundColor: `${color}15` }}
        >
          {event.startTime}
        </span>
        <span className="truncate text-slate-700 font-semibold">
          {event.title}
        </span>
      </div>
    </button>
  );
}
