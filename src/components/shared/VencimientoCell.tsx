import { ChipMes } from './ChipMes';
import { formatDate, diffDays } from '@/lib/date';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Cliente, ConfigUsuario } from '@/types';
import { AlertCircle } from 'lucide-react';

interface VencimientoCellProps {
  cliente: Cliente;
  config?: ConfigUsuario;
  className?: string;
}

type TipoVencimiento = 'rc' | 'mercancias' | 'acc' | 'flotas' | 'pyme';

interface VencimientoInfo {
  tipo: TipoVencimiento;
  label: string;
  fecha: string;
  dias: number;
}

export function VencimientoCell({ cliente, config, className }: VencimientoCellProps) {
  // Obtener todos los vencimientos disponibles con sus días
  const vencimientos: VencimientoInfo[] = ([
    { tipo: 'rc' as const, label: 'RC', fecha: cliente.vencimientos?.rc },
    { tipo: 'mercancias' as const, label: 'Mercancías', fecha: cliente.vencimientos?.mercancias },
    { tipo: 'acc' as const, label: 'ACC', fecha: cliente.vencimientos?.acc },
    { tipo: 'flotas' as const, label: 'Flotas', fecha: cliente.vencimientos?.flotas },
    { tipo: 'pyme' as const, label: 'PYME', fecha: cliente.vencimientos?.pyme },
  ] as { tipo: TipoVencimiento; label: string; fecha: string | undefined }[])
    .filter((v): v is { tipo: TipoVencimiento; label: string; fecha: string } => !!v.fecha)
    .map(v => ({ ...v, dias: diffDays(v.fecha) }));

  // Agregar la fecha de fin de póliza como fallback si no hay vencimientos
  if (vencimientos.length === 0 && cliente.poliza?.fechaFin) {
    vencimientos.push({
      tipo: 'rc',
      label: 'Póliza',
      fecha: cliente.poliza.fechaFin,
      dias: diffDays(cliente.poliza.fechaFin)
    });
  }

  // Si no hay ningún vencimiento
  if (vencimientos.length === 0) {
    return <span className="text-muted-foreground">Sin definir</span>;
  }

  // Ordenar por días (el que vence antes primero)
  vencimientos.sort((a, b) => a.dias - b.dias);

  // El primero es el más urgente
  const masUrgente = vencimientos[0];
  const hayVencidos = masUrgente.dias < 0;
  const hayProximos = masUrgente.dias >= 0 && masUrgente.dias <= 30;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {/* Vencimiento más urgente - Destacado */}
      <div className={cn(
        'flex items-center gap-2 p-1.5 rounded-md border',
        hayVencidos && 'bg-red-500/10 border-red-500/30',
        hayProximos && 'bg-amber-500/10 border-amber-500/30',
        !hayVencidos && !hayProximos && 'bg-green-500/10 border-green-500/30'
      )}>
        {(hayVencidos || hayProximos) && (
          <AlertCircle className={cn(
            'h-4 w-4 flex-shrink-0',
            hayVencidos && 'text-red-600',
            hayProximos && 'text-amber-600'
          )} />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <ChipMes fecha={masUrgente.fecha} config={config} />
            <span className="text-xs font-semibold text-muted-foreground">{masUrgente.label}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm font-medium">
              {formatDate(masUrgente.fecha)}
            </span>
            <Badge
              variant="outline"
              className={cn(
                'text-xs px-1 py-0 border',
                masUrgente.dias < 0 && 'bg-red-500/15 text-red-700 border-red-500/30',
                masUrgente.dias >= 0 && masUrgente.dias <= 30 && 'bg-amber-500/15 text-amber-700 border-amber-500/30',
                masUrgente.dias > 30 && 'bg-green-500/15 text-green-700 border-green-500/30'
              )}
            >
              {masUrgente.dias < 0 ? `Vencido hace ${Math.abs(masUrgente.dias)} días` : 
               masUrgente.dias === 0 ? 'Vence hoy' :
               `Faltan ${masUrgente.dias} días`}
            </Badge>
          </div>
        </div>
      </div>

      {/* Resto de vencimientos */}
      {vencimientos.length > 1 && (
        <div className="flex flex-col gap-1 pl-2 border-l-2 border-muted">
          {vencimientos.slice(1).map((v) => (
            <VencimientoItem key={v.tipo} vencimiento={v} config={config} />
          ))}
        </div>
      )}
    </div>
  );
}

interface VencimientoItemProps {
  vencimiento: VencimientoInfo;
  config?: ConfigUsuario;
}

function VencimientoItem({ vencimiento, config }: VencimientoItemProps) {
  const dias = vencimiento.dias;
  const isVencido = dias < 0;

  return (
    <div className="flex items-center gap-2 py-0.5">
      <ChipMes fecha={vencimiento.fecha} config={config} size="sm" />
      <span className="text-xs text-muted-foreground w-16">{vencimiento.label}</span>
      <span className="text-xs">{formatDate(vencimiento.fecha)}</span>
      <span className={cn(
        'text-xs',
        isVencido && 'text-red-600 font-medium',
        dias >= 0 && dias <= 30 && 'text-amber-600',
        dias > 30 && 'text-green-600'
      )}>
        {isVencido ? `(${Math.abs(dias)}d)` : `(${dias}d)`}
      </span>
    </div>
  );
}
