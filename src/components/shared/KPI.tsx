import { cn } from '@/lib/utils';

interface KPIProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'blue' | 'green' | 'amber' | 'purple' | 'slate';
}

const colorVariants = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    gradient: 'from-blue-500 to-blue-600',
  },
  green: {
    bg: 'bg-emerald-50',
    icon: 'text-emerald-600',
    gradient: 'from-emerald-500 to-emerald-600',
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'text-amber-600',
    gradient: 'from-amber-500 to-amber-600',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    gradient: 'from-purple-500 to-purple-600',
  },
  slate: {
    bg: 'bg-slate-50',
    icon: 'text-slate-600',
    gradient: 'from-slate-500 to-slate-600',
  },
};

export function KPI({
  title,
  value,
  subtitle,
  icon,
  className,
  onClick,
  color = 'blue',
}: KPIProps) {
  const colors = colorVariants[color];

  return (
    <div
      className={cn(
        'metric-card cursor-pointer group',
        onClick && 'hover:shadow-lg',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#615d59] mb-1 truncate">
            {title}
          </p>
          <p className="text-3xl font-bold text-black/95 tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-[#a39e98] mt-2 font-medium">
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
              colors.bg
            )}
          >
            <div className={colors.icon}>{icon}</div>
          </div>
        )}
      </div>
    </div>
  );
}
