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
    className: 'bg-blue-500/15 text-blue-700'
  },
  gmail_enviado: {
    label: 'Gmail enviado',
    className: 'bg-amber-500/15 text-amber-700'
  },
  reunido: {
    label: 'Reunido',
    className: 'bg-violet-500/15 text-violet-700'
  },
  propuesta_activa: {
    label: 'Propuesta activa',
    className: 'bg-emerald-500/15 text-emerald-700'
  },
  vendido: {
    label: 'Vendido',
    className: 'bg-green-600 text-white'
  },
  no_llegamos: {
    label: 'No llegamos',
    className: 'bg-slate-400/15 text-slate-700'
  },
};

export function EstadoBadge({ estado, className }: EstadoBadgeProps) {
  if (!estado) {
    return (
      <Badge className={cn('bg-muted text-muted-foreground', className)}>
        Sin definir
      </Badge>
    );
  }
  const config = estadoConfig[estado];
  if (!config) {
    return (
      <Badge className={cn('bg-muted text-muted-foreground', className)}>
        {estado}
      </Badge>
    );
  }
  return (
    <Badge className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}

