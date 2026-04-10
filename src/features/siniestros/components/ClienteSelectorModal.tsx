import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Building2 } from 'lucide-react';
import type { Cliente } from '@/types';

interface ClienteSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientes: Cliente[];
  onSelect: (cliente: Cliente) => void;
  existingClientIds: string[];
}

export function ClienteSelectorModal({
  isOpen,
  onClose,
  clientes,
  onSelect,
  existingClientIds,
}: ClienteSelectorModalProps) {
  const [search, setSearch] = useState('');

  // Filtrar clientes que no tengan historial aún y que empiecen por la búsqueda
  const clientesFiltrados = useMemo(() => {
    return clientes.filter((c) => {
      // Excluir clientes que ya tienen historial
      if (existingClientIds.includes(c.id)) return false;

      // Filtrar por búsqueda (empieza por)
      if (search) {
        return c.empresa.toLowerCase().startsWith(search.toLowerCase());
      }

      return true;
    });
  }, [clientes, existingClientIds, search]);

  const handleSelect = (cliente: Cliente) => {
    onSelect(cliente);
    setSearch('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Seleccionar Cliente</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar empresa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {/* Lista de clientes */}
          <div className="border rounded-lg max-h-[300px] overflow-y-auto">
            {clientesFiltrados.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {search ? (
                  <p>No se encontraron empresas que empiecen por "{search}"</p>
                ) : (
                  <p>No hay clientes disponibles</p>
                )}
              </div>
            ) : (
              <div className="divide-y">
                {clientesFiltrados.map((cliente) => (
                  <button
                    key={cliente.id}
                    onClick={() => handleSelect(cliente)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors text-left"
                  >
                    <Building2 className="w-5 h-5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{cliente.empresa}</p>
                      {cliente.contacto && (
                        <p className="text-sm text-muted-foreground truncate">
                          {cliente.contacto}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <p className="text-xs text-muted-foreground text-center">
            Solo se muestran clientes existentes sin historial de siniestros
          </p>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
