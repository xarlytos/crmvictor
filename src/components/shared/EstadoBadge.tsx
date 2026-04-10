import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { EstadoCliente } from '@/types';

interface EstadoBadgeProps {
  estado?: EstadoCliente;
  className?: string;
}

const estadoConfig: Record<string, { label: string; className: string }> = {
  llamado: {
    label: 'Llamado',
    className:
      'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border-blue-200 hover:from-blue-200 hover:to-blue-100',
  },
  gmail_enviado: {
    label: 'Gmail enviado',
    className:
      'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 border-amber-200 hover:from-amber-200 hover:to-amber-100',
  },
  reunido: {
    label: 'Reunido',
    className:
      'bg-gradient-to-r from-violet-100 to-violet-50 text-violet-700 border-violet-200 hover:from-violet-200 hover:to-violet-100',
  },
  propuesta_activa: {
    label: 'Propuesta activa',
    className:
      'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 border-emerald-200 hover:from-emerald-200 hover:to-emerald-100',
  },
  vendido: {
    label: 'Vendido',
    className:
      'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-500/20',
  },
  no_llegamos: {
    label: 'No llegamos',
    className:
      'bg-gradient-to-r from-slate-100 to-slate-50 text-slate-600 border-slate-200 hover:from-slate-200 hover:to-slate-100',
  },
};

export function EstadoBadge({ estado, className }: EstadoBadgeProps) {
  if (!estado) {
    return (
      <Badge
        className={cn(
          'bg-gradient-to-r from-slate-100 to-slate-50 text-slate-500 border-slate-200',
          className
        )}
      >
        Sin definir
      </Badge>
    );
  }

  const config = estadoConfig[estado];

  if (!config) {
    return (
      <Badge
        variant="outline"
        className={cn('text-slate-600 border-slate-200', className)}
      >
        {estado}
      </Badge>
    );
  }

  return (
    <Badge
      className={cn(
        'font-semibold text-xs px-2.5 py-0.5 rounded-full border transition-all duration-300',
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}
