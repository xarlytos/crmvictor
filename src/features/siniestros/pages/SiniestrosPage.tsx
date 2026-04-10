import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dataProvider } from '@/config/dataProvider';
import { useSiniestrosStore } from '../store/siniestros.store';
import { ClienteSelectorModal } from '../components/ClienteSelectorModal';
import { SiniestrosTableModal } from '../components/SiniestrosTableModal';
import { generateSiniestroPDF } from '../utils/pdfGenerator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Plus,
  Search,
  Download,
  Building2,
  FileText,
  MoreVertical,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import type { SiniestroGrupo, Cliente } from '@/types';

export function SiniestrosPage() {
  const { data: clientesData } = useQuery({
    queryKey: ['clientes', 'all'],
    queryFn: () => dataProvider.listClientes(),
  });
  const clientes = clientesData?.items || [];
  const {
    grupos,
    filtros,
    selectedIds,
    setFiltros,
    addGrupo,
    deleteGrupo,
    updateGrupo,
    toggleSeleccion,
    seleccionarTodos,
    deseleccionarTodos,
    getGruposFiltrados,
    getMetricas,
  } = useSiniestrosStore();
  const { toast } = useToast();

  const [isClienteSelectorOpen, setIsClienteSelectorOpen] = useState(false);
  const [selectedGrupo, setSelectedGrupo] = useState<SiniestroGrupo | null>(null);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [observacionesEditando, setObservacionesEditando] = useState<string | null>(null);

  const gruposFiltrados = useMemo(() => {
    return getGruposFiltrados();
  }, [grupos, filtros]);

  const metricas = getMetricas();

  const existingClientIds = useMemo(() => {
    return grupos.map((g) => g.clienteId);
  }, [grupos]);

  const handleCreateGrupo = (cliente: Cliente) => {
    const id = addGrupo({
      clienteId: cliente.id,
      empresa: {
        nombre: cliente.empresa,
        direccion: cliente.direccion,
        cp: '',
        ciudad: '',
      },
      observacionesGenerales: '',
      siniestros: [],
    });

    toast({
      title: 'Historial creado',
      description: `Se ha creado el historial para ${cliente.empresa}`,
    });

    const nuevoGrupo = useSiniestrosStore.getState().getGrupoById(id);
    if (nuevoGrupo) {
      setSelectedGrupo(nuevoGrupo);
      setIsTableModalOpen(true);
    }
  };

  const handleOpenTable = (grupo: SiniestroGrupo) => {
    setSelectedGrupo(grupo);
    setIsTableModalOpen(true);
  };

  const handleDeleteGrupo = (id: string, nombre: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar el historial de ${nombre}?`)) {
      deleteGrupo(id);
      toast({
        title: 'Historial eliminado',
        description: 'El historial de siniestros se ha eliminado',
      });
    }
  };

  const handleDownloadSelected = () => {
    const gruposSeleccionados = grupos.filter((g) => selectedIds.includes(g.id));

    gruposSeleccionados.forEach((grupo) => {
      if (grupo.siniestros.length > 0) {
        generateSiniestroPDF(grupo, grupo.siniestros);
      }
    });

    toast({
      title: 'Descargando PDFs',
      description: `Generando ${gruposSeleccionados.length} documentos...`,
    });

    deseleccionarTodos();
  };

  const handleDownloadGrupo = (grupo: SiniestroGrupo) => {
    if (grupo.siniestros.length === 0) {
      toast({
        title: 'Sin siniestros',
        description: 'Este cliente no tiene siniestros registrados',
        variant: 'destructive',
      });
      return;
    }

    generateSiniestroPDF(grupo, grupo.siniestros);
    toast({
      title: 'PDF generado',
      description: 'Descargando documento...',
    });
  };

  const handleUpdateObservaciones = (id: string, value: string) => {
    updateGrupo(id, { observacionesGenerales: value });
  };

  const allSelected = gruposFiltrados.length > 0 && selectedIds.length === gruposFiltrados.length;

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Siniestros</h1>
          <p className="text-muted-foreground mt-1">
            Gestión de historiales de siniestros por cliente
          </p>
        </div>

        <Button onClick={() => setIsClienteSelectorOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo historial de siniestros
        </Button>
      </div>

      {/* Métricas y Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Métricas */}
        <div className="bg-card border rounded-lg p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{metricas.totalClientes}</p>
            <p className="text-sm text-muted-foreground">Total clientes</p>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center">
            <FileText className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold">{metricas.siniestrosAbiertos}</p>
            <p className="text-sm text-muted-foreground">Siniestros abiertos</p>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar empresa..."
            value={filtros.search || ''}
            onChange={(e) => setFiltros({ search: e.target.value })}
            className="pl-10 h-full"
          />
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          <Select
            value={filtros.estado || '__all__'}
            onValueChange={(v) =>
              setFiltros({ estado: v === '__all__' ? undefined : (v as any) })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todos los estados</SelectItem>
              <SelectItem value="abierto">Abierto</SelectItem>
              <SelectItem value="cerrado">Cerrado</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filtros.valoracion || '__all__'}
            onValueChange={(v) =>
              setFiltros({ valoracion: v === '__all__' ? undefined : (v as any) })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Valoración" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todas las valoraciones</SelectItem>
              <SelectItem value="positiva">Positiva</SelectItem>
              <SelectItem value="intermedia">Intermedia</SelectItem>
              <SelectItem value="negativa">Negativa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Acciones bulk */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-4 mb-4 p-3 bg-primary/5 border rounded-lg">
          <span className="text-sm font-medium">{selectedIds.length} seleccionados</span>
          <Button variant="outline" size="sm" onClick={deseleccionarTodos}>
            Deseleccionar
          </Button>
          <Button size="sm" onClick={handleDownloadSelected}>
            <Download className="w-4 h-4 mr-2" />
            Descargar seleccionados
          </Button>
        </div>
      )}

      {/* Lista de grupos */}
      {gruposFiltrados.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border rounded-lg border-dashed">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No hay historiales de siniestros</h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            Crea un nuevo historial seleccionando un cliente existente del CRM.
          </p>
          <Button onClick={() => setIsClienteSelectorOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo historial de siniestros
          </Button>
        </div>
      ) : (
        <div className="flex-1 overflow-auto border rounded-lg">
          <table className="w-full">
            <thead className="bg-muted sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left w-10">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        seleccionarTodos(gruposFiltrados.map((g) => g.id));
                      } else {
                        deseleccionarTodos();
                      }
                    }}
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium">Empresa</th>
                <th className="px-4 py-3 text-left font-medium w-1/3">Observaciones</th>
                <th className="px-4 py-3 text-center font-medium w-24">Siniestros</th>
                <th className="px-4 py-3 text-center font-medium w-32">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {gruposFiltrados.map((grupo) => (
                <tr key={grupo.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selectedIds.includes(grupo.id)}
                      onCheckedChange={() => toggleSeleccion(grupo.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleOpenTable(grupo)}
                      className="text-left font-medium hover:text-primary transition-colors"
                    >
                      {grupo.empresa.nombre}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {observacionesEditando === grupo.id ? (
                      <Input
                        value={grupo.observacionesGenerales}
                        onChange={(e) => handleUpdateObservaciones(grupo.id, e.target.value)}
                        onBlur={() => setObservacionesEditando(null)}
                        autoFocus
                        className="h-8"
                      />
                    ) : (
                      <button
                        onClick={() => setObservacionesEditando(grupo.id)}
                        className="text-left text-muted-foreground hover:text-foreground transition-colors w-full"
                      >
                        {grupo.observacionesGenerales || (
                          <span className="text-muted-foreground/50 italic">Añadir observaciones...</span>
                        )}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 font-medium text-sm">
                      {grupo.siniestros.length}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDownloadGrupo(grupo)}
                        title="Descargar PDF"
                      >
                        <Download className="w-4 h-4" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenTable(grupo)}>
                            <FileText className="w-4 h-4 mr-2" />
                            Ver tabla
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteGrupo(grupo.id, grupo.empresa.nombre)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modales */}
      <ClienteSelectorModal
        isOpen={isClienteSelectorOpen}
        onClose={() => setIsClienteSelectorOpen(false)}
        clientes={clientes}
        onSelect={handleCreateGrupo}
        existingClientIds={existingClientIds}
      />

      {selectedGrupo && (
        <SiniestrosTableModal
          isOpen={isTableModalOpen}
          onClose={() => {
            setIsTableModalOpen(false);
            setSelectedGrupo(null);
          }}
          grupo={selectedGrupo}
        />
      )}
    </div>
  );
}
