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
        'w-full text-left rounded-md px-2 py-1.5 text-xs',
        'transition-all duration-150 ease-in-out',
        'hover:shadow-sm hover:scale-[1.02]',
        'focus:outline-none focus:ring-2 focus:ring-offset-1'
      )}
      style={{
        backgroundColor: `${color}15`, // 10% opacidad
        borderLeft: `3px solid ${color}`,
        '--tw-ring-color': color,
      } as React.CSSProperties}
      title={`${event.title} (${event.startTime} - ${event.endTime})`}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="font-medium text-gray-700 shrink-0">
          {event.startTime}
        </span>
        <span className="truncate text-gray-900 font-medium">
          {event.title}
        </span>
      </div>
    </button>
  );
}
