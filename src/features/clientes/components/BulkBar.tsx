import { Button } from '@/components/ui/button';
import { X, FileDown, Trash2 } from 'lucide-react';
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
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 shadow-2xl rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-500 via-violet-600 to-purple-600 text-white px-6 py-4">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <span className="font-bold">{selectedCount}</span>
          </div>
          <span className="text-sm font-semibold">
            {selectedCount === 1 ? 'cliente seleccionado' : 'clientes seleccionados'}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg bg-white/10 hover:bg-white/20 text-white"
            onClick={onClearSelection}
            aria-label="Limpiar selección"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Select value={estadoValue} onValueChange={handleEstadoChange}>
            <SelectTrigger className="h-9 w-[180px] bg-white/10 border-white/20 text-white rounded-xl hover:bg-white/20">
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
            <Button variant="outline" size="sm" onClick={onBulkExport} className="gap-2 rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white">
              <FileDown className="h-4 w-4" />
              <span className="sr-only md:not-sr-only">Exportar PDF</span>
            </Button>
          )}

          {onBulkDelete && (
            <Button variant="destructive" size="sm" onClick={onBulkDelete} className="gap-2 rounded-xl bg-rose-500 hover:bg-rose-600 border-0">
              <Trash2 className="h-4 w-4" />
              <span className="sr-only md:not-sr-only">Eliminar</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

