import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Download, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { EstadoCliente } from '@/types';
import { enumToLabel } from '@/lib/formatters';

interface BulkBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkEstadoChange: (estado: EstadoCliente) => void;
  onBulkExport?: () => void;
  onBulkDelete?: () => void;
}

export function BulkBar({
  selectedCount,
  onClearSelection,
  onBulkEstadoChange,
  onBulkExport,
  onBulkDelete,
}: BulkBarProps) {
  const [estadoValue, setEstadoValue] = useState<string>('');

  const handleEstadoChange = (value: string) => {
    setEstadoValue(value);
    if (value) {
      onBulkEstadoChange(value as EstadoCliente);
      setEstadoValue(''); // Reset after action
    }
  };

  if (selectedCount === 0) return null;

  return (
    <Card className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 shadow-lg border-2">
      <div className="flex items-center gap-4 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {selectedCount} {selectedCount === 1 ? 'cliente seleccionado' : 'clientes seleccionados'}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onClearSelection}
            aria-label="Limpiar selección"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Select value={estadoValue} onValueChange={handleEstadoChange}>
            <SelectTrigger className="h-9 w-[180px]">
              <SelectValue placeholder="Cambiar estado" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(enumToLabel.estado).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {onBulkExport && (
            <Button variant="outline" size="sm" onClick={onBulkExport} className="gap-2">
              <Download className="h-4 w-4" />
              <span className="sr-only md:not-sr-only">Exportar Excel</span>
            </Button>
          )}

          {onBulkDelete && (
            <Button variant="destructive" size="sm" onClick={onBulkDelete} className="gap-2">
              <Trash2 className="h-4 w-4" />
              <span className="sr-only md:not-sr-only">Eliminar</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

