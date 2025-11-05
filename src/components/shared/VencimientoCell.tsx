import { ChipMes } from './ChipMes';
import { formatDate, diffDays, severityByDays } from '@/lib/date';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Cliente, ConfigUsuario } from '@/types';

interface VencimientoCellProps {
  cliente: Cliente;
  config?: ConfigUsuario;
  className?: string;
}

export function VencimientoCell({ cliente, config, className }: VencimientoCellProps) {
  // Solo usar vencimientos si están definidos explícitamente
  // No usar poliza.fechaFin como fallback automático
  const fechaVencimiento = 
    cliente.vencimientos?.flotas || 
    cliente.vencimientos?.mercancias;

  if (!fechaVencimiento) return <span className="text-muted-foreground">Sin definir</span>;

  const dias = diffDays(fechaVencimiento);
  const severity = severityByDays(dias);
  const isVencido = dias < 0;

  // Colores según severidad
  const severityColors = {
    low: 'bg-green-500/15 text-green-700 border-green-500/30',
    medium: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
    high: 'bg-red-500/15 text-red-700 border-red-500/30',
  };

  // Texto del badge
  const getBadgeText = () => {
    if (isVencido) {
      return 'Vencido';
    }
    // Siempre mostrar "Faltan X días" independientemente de la severidad
    return `Faltan ${dias} días`;
  };

  // Color del badge cuando está vencido
  const badgeColor = isVencido 
    ? 'bg-red-500/15 text-red-700 border-red-500/30'
    : severityColors[severity];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <ChipMes fecha={fechaVencimiento} config={config} />
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-medium line-clamp-1" title={formatDate(fechaVencimiento)}>
          {formatDate(fechaVencimiento)}
        </span>
        <Badge
          variant="outline"
          className={cn(
            'text-xs px-1.5 py-0 border',
            badgeColor
          )}
        >
          {getBadgeText()}
        </Badge>
      </div>
    </div>
  );
}

