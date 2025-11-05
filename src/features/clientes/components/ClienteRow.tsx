import { EstadoBadge } from '@/components/shared/EstadoBadge';
import { VencimientoCell } from '@/components/shared/VencimientoCell';
import { formatPhone, formatEmail, enumToLabel } from '@/lib/formatters';
import { formatDate } from '@/lib/date';
import { Phone, Mail } from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableRow, DataTableCell } from '@/components/shared/DataTable';
import type { Cliente, ConfigUsuario } from '@/types';

interface ClienteRowProps {
  cliente: Cliente;
  config?: ConfigUsuario;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  onEdit?: (cliente: Cliente) => void;
  columnVisibility?: {
    empresa: boolean;
    telefono: boolean;
    correo: boolean;
    estado: boolean;
    mercancia: boolean;
    transporte: boolean;
    vencimientos: boolean;
    facturacion: boolean;
    fechaLlamada: boolean;
    numVehiculos: boolean;
    acciones: boolean;
  };
}

export function ClienteRow({
  cliente,
  config,
  selected = false,
  onSelect,
  onEdit,
  columnVisibility,
}: ClienteRowProps) {
  const handleRowClick = (e: React.MouseEvent) => {
    // No hacer nada si no hay manejador de edición
    if (!onEdit) return;
    
    // No abrir drawer si click es en checkbox o botones
    const target = e.target as HTMLElement;
    if (
      target.closest('input[type="checkbox"]') ||
      target.closest('button') ||
      target.closest('a')
    ) {
      return;
    }
    onEdit(cliente);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onEdit) {
      onEdit(cliente);
    } else if (e.key === ' ') {
      e.preventDefault();
      onSelect?.(!selected);
    }
  };

  const defaultVisibility = {
    empresa: true,
    telefono: true,
    correo: true,
    estado: true,
    mercancia: true,
    transporte: true,
    vencimientos: true,
    facturacion: true,
    fechaLlamada: true,
    numVehiculos: true,
    acciones: false,
  };

  const visibility = columnVisibility || defaultVisibility;

  return (
    <TooltipProvider delayDuration={300}>
      <DataTableRow
        selected={selected}
        onClick={(e) => handleRowClick(e)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        {/* Checkbox */}
        {onSelect && (
          <DataTableCell className="w-12">
            <Checkbox
              checked={selected}
              onCheckedChange={(checked) => onSelect?.(checked === true)}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Seleccionar ${cliente.empresa}`}
            />
          </DataTableCell>
        )}

        {/* Empresa / Contacto */}
        {visibility.empresa && (
          <DataTableCell className="min-w-[300px]">
            <div className="flex flex-col gap-0.5">
              <span className="font-medium whitespace-normal" title={cliente.empresa}>
                {cliente.empresa}
              </span>
              <span className="text-xs text-muted-foreground line-clamp-1" title={cliente.contacto}>
                {cliente.contacto}
              </span>
            </div>
          </DataTableCell>
        )}

        {/* Teléfono */}
        {visibility.telefono && (
          <DataTableCell className="w-[150px]">
            {cliente.telefono ? (
              <a
                href={`tel:${cliente.telefono}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 bg-muted px-2 py-1 rounded-md hover:bg-muted/80 transition-colors"
              >
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm">{formatPhone(cliente.telefono)}</span>
              </a>
            ) : (
              <span className="text-sm text-muted-foreground">-</span>
            )}
          </DataTableCell>
        )}

        {/* Correo */}
        {visibility.correo && (
          <DataTableCell className="w-[280px] max-w-[280px]">
            {cliente.correo ? (
              <a
                href={`mailto:${cliente.correo}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 text-primary hover:underline w-full overflow-hidden"
                title={cliente.correo}
              >
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="text-sm truncate min-w-0 flex-1">{formatEmail(cliente.correo)}</span>
              </a>
            ) : (
              <span className="text-sm text-muted-foreground">-</span>
            )}
          </DataTableCell>
        )}

        {/* Estado */}
        {visibility.estado && (
          <DataTableCell className="w-[200px]">
            <EstadoBadge estado={cliente.estado} />
          </DataTableCell>
        )}

        {/* Mercancía */}
        {visibility.mercancia && (
          <DataTableCell className="w-[200px]">
            <span className="text-sm line-clamp-1" title={cliente.tipoCarga ? enumToLabel.tipoCarga[cliente.tipoCarga] : 'Sin definir'}>
              {cliente.tipoCarga ? enumToLabel.tipoCarga[cliente.tipoCarga] : 'Sin definir'}
            </span>
          </DataTableCell>
        )}

        {/* Transporte */}
        {visibility.transporte && (
          <DataTableCell className="w-[140px]">
            <span className="text-sm">{cliente.transporte ? enumToLabel.transporte[cliente.transporte] : 'Sin definir'}</span>
          </DataTableCell>
        )}

        {/* Vencimientos */}
        {visibility.vencimientos && (
          <DataTableCell className="w-[220px]">
            <VencimientoCell cliente={cliente} config={config} />
          </DataTableCell>
        )}

        {/* Facturación */}
        {visibility.facturacion && (
          <DataTableCell className="w-[120px] text-right">
            <span className="text-sm">{cliente.facturacion || '-'}</span>
          </DataTableCell>
        )}

        {/* Fecha de Llamada */}
        {visibility.fechaLlamada && (
          <DataTableCell className="w-[160px]">
            <span className="text-sm">
              {cliente.fechaLlamada ? formatDate(cliente.fechaLlamada) : '-'}
            </span>
          </DataTableCell>
        )}

        {/* Número de Vehículos */}
        {visibility.numVehiculos && (
          <DataTableCell className="w-[150px]">
            <span className="text-sm">{cliente.numVehiculos ?? '-'}</span>
          </DataTableCell>
        )}
      </DataTableRow>
    </TooltipProvider>
  );
}
