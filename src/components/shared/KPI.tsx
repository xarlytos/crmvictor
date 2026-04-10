import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPIProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'blue' | 'violet' | 'emerald' | 'amber' | 'rose' | 'cyan';
}

const colorVariants = {
  blue: {
    gradient: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-500',
    light: 'bg-blue-50',
    text: 'text-blue-600',
    shadow: 'shadow-blue-500/25',
    glow: 'bg-blue-400/20',
  },
  violet: {
    gradient: 'from-violet-500 to-violet-600',
    bg: 'bg-violet-500',
    light: 'bg-violet-50',
    text: 'text-violet-600',
    shadow: 'shadow-violet-500/25',
    glow: 'bg-violet-400/20',
  },
  emerald: {
    gradient: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-500',
    light: 'bg-emerald-50',
    text: 'text-emerald-600',
    shadow: 'shadow-emerald-500/25',
    glow: 'bg-emerald-400/20',
  },
  amber: {
    gradient: 'from-amber-500 to-amber-600',
    bg: 'bg-amber-500',
    light: 'bg-amber-50',
    text: 'text-amber-600',
    shadow: 'shadow-amber-500/25',
    glow: 'bg-amber-400/20',
  },
  rose: {
    gradient: 'from-rose-500 to-rose-600',
    bg: 'bg-rose-500',
    light: 'bg-rose-50',
    text: 'text-rose-600',
    shadow: 'shadow-rose-500/25',
    glow: 'bg-rose-400/20',
  },
  cyan: {
    gradient: 'from-cyan-500 to-cyan-600',
    bg: 'bg-cyan-500',
    light: 'bg-cyan-50',
    text: 'text-cyan-600',
    shadow: 'shadow-cyan-500/25',
    glow: 'bg-cyan-400/20',
  },
};

export function KPI({
  title,
  value,
  subtitle,
  icon,
  className,
  onClick,
  trend,
  trendValue,
  color = 'blue',
}: KPIProps) {
  const colors = colorVariants[color];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-white p-6',
        'shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_30px_-5px_rgba(0,0,0,0.08)]',
        'transition-all duration-500 ease-out cursor-pointer group',
        'hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15),0_10px_20px_-5px_rgba(0,0,0,0.1)]',
        'hover:-translate-y-1',
        className
      )}
      onClick={onClick}
    >
      {/* Top gradient line */}
      <div className={cn(
        'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500',
        colors.gradient
      )} />

      {/* Glow effect */}
      <div className={cn(
        'absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700',
        colors.glow
      )} />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">
              {title}
            </p>
            <p className="text-3xl font-extrabold text-slate-800 tracking-tight">
              {value}
            </p>

            {/* Trend indicator */}
            {trend && (
              <div className="flex items-center gap-1.5 mt-2">
                {trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                ) : trend === 'down' ? (
                  <TrendingDown className="w-4 h-4 text-rose-500" />
                ) : null}
                {trendValue && (
                  <span className={cn(
                    'text-xs font-bold',
                    trend === 'up' ? 'text-emerald-600' :
                    trend === 'down' ? 'text-rose-600' : 'text-slate-500'
                  )}>
                    {trendValue}
                  </span>
                )}
              </div>
            )}

            {subtitle && !trend && (
              <p className="text-xs font-medium text-slate-400 mt-2">
                {subtitle}
              </p>
            )}
          </div>

          {/* Icon container */}
          <div className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0',
            'bg-gradient-to-br text-white shadow-lg',
            colors.gradient,
            colors.shadow,
            'transform group-hover:scale-110 transition-transform duration-500'
          )}>
            {icon}
          </div>
        </div>

        {/* Bottom decoration */}
        <div className={cn(
          'absolute -bottom-6 -left-6 w-24 h-24 rounded-full blur-2xl opacity-20',
          colors.bg
        )} />
      </div>
    </div>
  );
}
