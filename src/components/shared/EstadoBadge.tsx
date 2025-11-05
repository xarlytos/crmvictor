import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { EstadoCliente } from '@/types';

interface EstadoBadgeProps {
  estado?: EstadoCliente;
  className?: string;
}

const estadoConfig: Record<EstadoCliente, { label: string; className: string }> = {
  contratado: { 
    label: 'Contratado', 
    className: 'bg-blue-600 text-white' 
  },
  contactado_buena_pinta: { 
    label: 'Contactado - Buena Pinta', 
    className: 'bg-amber-500/15 text-amber-700' 
  },
  en_negociacion: { 
    label: 'En Negociación', 
    className: 'bg-violet-500/15 text-violet-700' 
  },
  descartado: { 
    label: 'Descartado', 
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
  return (
    <Badge className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}

