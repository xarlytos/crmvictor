import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getMonthFromDate } from '@/lib/date';
import type { ConfigUsuario } from '@/types';

interface ChipMesProps {
  fecha: string | Date;
  config?: ConfigUsuario;
  className?: string;
}

const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export function ChipMes({ fecha, config, className }: ChipMesProps) {
  const mes = getMonthFromDate(fecha);
  const mesNombre = meses[mes - 1];
  const color = config?.monthColors?.[mes] || '#6b7280';

  // Determinar si el texto debe ser claro u oscuro según el color de fondo
  const getTextColor = (bgColor: string): string => {
    // Simple check: si el color es muy claro, usar texto oscuro
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155 ? 'text-gray-900' : 'text-white';
  };

  return (
    <Badge
      className={cn('font-medium', getTextColor(color), className)}
      style={{ backgroundColor: color }}
    >
      {mesNombre}
    </Badge>
  );
}

