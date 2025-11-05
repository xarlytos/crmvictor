import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Columns2 } from 'lucide-react';

export interface ColumnVisibility {
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
}

interface ColumnVisibilityMenuProps {
  columns: ColumnVisibility;
  onColumnsChange: (columns: ColumnVisibility) => void;
}

const columnLabels: Record<keyof ColumnVisibility, string> = {
  empresa: 'Empresa / Contacto',
  telefono: 'Teléfono',
  correo: 'Correo',
  estado: 'Estado',
  mercancia: 'Mercancía',
  transporte: 'Transporte',
  vencimientos: 'Vencimientos',
  facturacion: 'Facturación',
  fechaLlamada: 'Fecha de Llamada',
  numVehiculos: 'Número de Vehículos',
  acciones: 'Acciones',
};

export function ColumnVisibilityMenu({ columns, onColumnsChange }: ColumnVisibilityMenuProps) {
  const handleToggle = (key: keyof ColumnVisibility) => {
    onColumnsChange({
      ...columns,
      [key]: !columns[key],
    });
  };

  const visibleCount = Object.values(columns).filter(Boolean).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Columns2 className="h-4 w-4" />
          <span className="sr-only md:not-sr-only">Columnas</span>
          <span className="hidden md:inline">({visibleCount})</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Mostrar columnas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(Object.keys(columns) as Array<keyof ColumnVisibility>).map((key) => (
          <DropdownMenuCheckboxItem
            key={key}
            checked={columns[key]}
            onCheckedChange={() => handleToggle(key)}
          >
            {columnLabels[key]}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

