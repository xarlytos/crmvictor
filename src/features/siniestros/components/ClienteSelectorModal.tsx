import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Building2, User, ChevronRight, AlertCircle } from 'lucide-react';
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
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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

  const availableCount = clientes.length - existingClientIds.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2 text-white">
              <Building2 className="w-5 h-5" />
              Seleccionar Cliente
            </DialogTitle>
            <DialogDescription className="text-slate-300 mt-2">
              Elige un cliente existente para crear su historial de siniestros
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Escribe para buscar empresas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all"
              autoFocus
            />
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-slate-100 text-slate-600">
              {availableCount} disponible{availableCount !== 1 ? 's' : ''}
            </Badge>
            {search && (
              <Badge variant="secondary" className="bg-blue-50 text-blue-600">
                {clientesFiltrados.length} resultado{clientesFiltrados.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {/* Lista de clientes */}
          <div className="border rounded-xl overflow-hidden bg-slate-50/50">
            {clientesFiltrados.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="w-6 h-6 text-slate-400" />
                </div>
                {search ? (
                  <>
                    <p className="text-slate-600 font-medium">No se encontraron empresas</p>
                    <p className="text-sm text-slate-400 mt-1">
                      Ninguna empresa empieza por &quot;{search}&quot;
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-slate-600 font-medium">No hay clientes disponibles</p>
                    <p className="text-sm text-slate-400 mt-1">
                      Todos los clientes ya tienen un historial de siniestros
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100">
                {clientesFiltrados.map((cliente, index) => (
                  <button
                    key={cliente.id}
                    onClick={() => handleSelect(cliente)}
                    onMouseEnter={() => setHoveredId(cliente.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-white transition-all text-left group"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    {/* Avatar/Icono */}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                      <span className="text-white font-semibold text-sm">
                        {cliente.empresa.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                        {cliente.empresa}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        {cliente.contacto && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {cliente.contacto}
                          </span>
                        )}
                        {cliente.telefono && (
                          <span className="text-xs text-slate-400">
                            {cliente.telefono}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Hover indicator */}
                    <ChevronRight
                      className={`w-5 h-5 text-slate-300 transition-all duration-200 ${
                        hoveredId === cliente.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                      }`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info footer */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 bg-slate-50 rounded-lg py-2">
            <AlertCircle className="w-3.5 h-3.5" />
            Solo se muestran clientes existentes sin historial de siniestros
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t bg-slate-50 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
