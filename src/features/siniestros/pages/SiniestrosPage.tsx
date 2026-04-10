import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dataProvider } from '@/config/dataProvider';
import {
  useSiniestros,
  useCreateSiniestroGrupo,
  useUpdateSiniestroGrupo,
  useDeleteSiniestroGrupo,
} from '../hooks/useSiniestros';
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
  Filter,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
  FileWarning,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { SiniestroGrupo, Cliente, FiltrosSiniestros } from '@/types';

export function SiniestrosPage() {
  const { data: clientesData } = useQuery({
    queryKey: ['clientes', 'all'],
    queryFn: () => dataProvider.listClientes(),
  });
  const clientes = clientesData?.items || [];

  // Filtros locales
  const [filtros, setFiltros] = useState<FiltrosSiniestros>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // React Query hooks
  const { data: grupos = [] } = useSiniestros(filtros);
  const createGrupo = useCreateSiniestroGrupo();
  const updateGrupo = useUpdateSiniestroGrupo();
  const deleteGrupo = useDeleteSiniestroGrupo();

  const { toast } = useToast();

  const [isClienteSelectorOpen, setIsClienteSelectorOpen] = useState(false);
  const [selectedGrupo, setSelectedGrupo] = useState<SiniestroGrupo | null>(null);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [observacionesEditando, setObservacionesEditando] = useState<string | null>(null);
  const [observacionesValue, setObservacionesValue] = useState<string>('');

  const gruposFiltrados = grupos;

  const metricas = useMemo(() => {
    const totalClientes = grupos.length;
    const siniestrosAbiertos = grupos.reduce(
      (acc, g) => acc + g.siniestros.filter((s) => s.estado === 'abierto').length,
      0
    );
    return { totalClientes, siniestrosAbiertos };
  }, [grupos]);

  const existingClientIds = useMemo(() => {
    return grupos.map((g) => g.clienteId);
  }, [grupos]);

  const handleCreateGrupo = async (cliente: Cliente) => {
    try {
      const nuevoGrupo = await createGrupo.mutateAsync({
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

      setSelectedGrupo(nuevoGrupo);
      setIsTableModalOpen(true);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear el historial',
        variant: 'destructive',
      });
    }
  };

  const handleOpenTable = (grupo: SiniestroGrupo) => {
    setSelectedGrupo(grupo);
    setIsTableModalOpen(true);
  };

  const handleDeleteGrupo = async (id: string, nombre: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar el historial de ${nombre}?`)) {
      try {
        await deleteGrupo.mutateAsync(id);
        toast({
          title: 'Historial eliminado',
          description: 'El historial de siniestros se ha eliminado',
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'No se pudo eliminar el historial',
          variant: 'destructive',
        });
      }
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

    setSelectedIds([]);
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

  const handleStartEditing = (grupo: SiniestroGrupo) => {
    setObservacionesEditando(grupo.id);
    setObservacionesValue(grupo.observacionesGenerales || '');
  };

  const handleSaveObservaciones = async (id: string) => {
    try {
      await updateGrupo.mutateAsync({ id, dto: { observacionesGenerales: observacionesValue } });
      setObservacionesEditando(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudieron guardar las observaciones',
        variant: 'destructive',
      });
    }
  };

  const toggleSeleccion = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const deseleccionarTodos = () => setSelectedIds([]);

  const hasActiveFilters = !!filtros.search || !!filtros.estado || !!filtros.valoracion;

  return (
    <div className="h-full flex flex-col space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <FileWarning className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
              Siniestros
            </h1>
            <p className="text-slate-500 mt-1">
              Gestión de historiales y seguimiento de siniestros
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsClienteSelectorOpen(true)}
          className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 shadow-lg shadow-slate-900/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo historial
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total clientes */}
        <div className="glass-card p-5 group hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">Clientes con historial</p>
              <p className="text-3xl font-extrabold text-slate-800">{metricas.totalClientes}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
              <Building2 className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-medium text-slate-500">
            <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-500" />
            Registrados en el sistema
          </div>
        </div>

        {/* Siniestros abiertos */}
        <div className="glass-card p-5 group hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">Siniestros abiertos</p>
              <p className="text-3xl font-extrabold text-amber-600">{metricas.siniestrosAbiertos}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform duration-300">
              <Clock className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-medium text-slate-500">
            <AlertCircle className="w-4 h-4 mr-1.5 text-amber-500" />
            Requieren atención
          </div>
        </div>

        {/* Total siniestros */}
        <div className="glass-card p-5 group hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">Total siniestros</p>
              <p className="text-3xl font-extrabold text-slate-800">
                {grupos.reduce((acc, g) => acc + g.siniestros.length, 0)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-lg shadow-slate-500/20 group-hover:scale-110 transition-transform duration-300">
              <FileText className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-medium text-slate-500">
            <span className="text-emerald-600 font-bold">
              {grupos.reduce((acc, g) => acc + g.siniestros.filter(s => s.estado === 'cerrado').length, 0)}
            </span>
            <span className="ml-1">cerrados</span>
          </div>
        </div>

        {/* Ratio */}
        <div className="glass-card p-5 group hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">Ratio apertura</p>
              <p className="text-3xl font-extrabold text-slate-800">
                {metricas.totalClientes > 0
                  ? Math.round((metricas.siniestrosAbiertos / grupos.reduce((acc, g) => acc + g.siniestros.length, 0)) * 100) || 0
                  : 0}%
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-110 transition-transform duration-300">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-medium text-slate-500">
            <span className="text-slate-400">De siniestros totales</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="glass-card p-5">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Búsqueda */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar empresa..."
              value={filtros.search || ''}
              onChange={(e) => setFiltros((prev) => ({ ...prev, search: e.target.value }))}
              className="pl-10 h-11 bg-white/50 border-slate-200 focus:bg-white transition-colors rounded-xl"
            />
          </div>

          {/* Filtros dropdown */}
          <div className="flex gap-3">
            <Select
              value={filtros.estado || '__all__'}
              onValueChange={(v) =>
                setFiltros((prev) => ({ ...prev, estado: v === '__all__' ? undefined : (v as any) }))
              }
            >
              <SelectTrigger className="w-[160px] h-11 bg-white/50 border-slate-200 rounded-xl">
                <Filter className="w-4 h-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="__all__">Todos los estados</SelectItem>
                <SelectItem value="abierto">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Abierto
                  </div>
                </SelectItem>
                <SelectItem value="cerrado">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Cerrado
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filtros.valoracion || '__all__'}
              onValueChange={(v) =>
                setFiltros((prev) => ({ ...prev, valoracion: v === '__all__' ? undefined : (v as any) }))
              }
            >
              <SelectTrigger className="w-[180px] h-11 bg-white/50 border-slate-200 rounded-xl">
                <SelectValue placeholder="Valoración" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="__all__">Todas las valoraciones</SelectItem>
                <SelectItem value="positiva">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Positiva
                  </div>
                </SelectItem>
                <SelectItem value="intermedia">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Intermedia
                  </div>
                </SelectItem>
                <SelectItem value="negativa">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Negativa
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 text-slate-400 hover:text-slate-600 rounded-xl"
                onClick={() => setFiltros({})}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Acciones bulk */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between gap-4 p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl text-white shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="font-semibold">
              {selectedIds.length} {selectedIds.length === 1 ? 'empresa seleccionada' : 'empresas seleccionadas'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
              onClick={deseleccionarTodos}
            >
              Cancelar
            </Button>
            <Button
              className="bg-white text-slate-900 hover:bg-white/90 rounded-xl font-semibold"
              onClick={handleDownloadSelected}
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar PDFs
            </Button>
          </div>
        </div>
      )}

      {/* Lista de grupos - Tabla tipo filas */}
      {gruposFiltrados.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 glass-card">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-6">
            <FileText className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            {hasActiveFilters ? 'No se encontraron resultados' : 'No hay historiales de siniestros'}
          </h3>
          <p className="text-slate-500 mb-6 max-w-sm">
            {hasActiveFilters
              ? 'Prueba con otros filtros de búsqueda o limpia los filtros actuales.'
              : 'Crea un nuevo historial seleccionando un cliente existente del CRM para comenzar.'}
          </p>
          {hasActiveFilters ? (
            <Button variant="outline" onClick={() => setFiltros({})} className="rounded-xl">
              Limpiar filtros
            </Button>
          ) : (
            <Button
              onClick={() => setIsClienteSelectorOpen(true)}
              className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl shadow-lg shadow-slate-900/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear primer historial
            </Button>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left w-10">
                    <Checkbox
                      checked={gruposFiltrados.length > 0 && selectedIds.length === gruposFiltrados.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          gruposFiltrados.forEach(g => {
                            if (!selectedIds.includes(g.id)) toggleSeleccion(g.id);
                          });
                        } else {
                          deseleccionarTodos();
                        }
                      }}
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Empresa</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600 w-1/3">Observaciones</th>
                  <th className="px-4 py-3 text-center font-medium text-slate-600 w-24">Siniestros</th>
                  <th className="px-4 py-3 text-center font-medium text-slate-600 w-32">Estado</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600 w-32">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {gruposFiltrados.map((grupo) => {
                  const siniestrosAbiertos = grupo.siniestros.filter(s => s.estado === 'abierto').length;
                  const siniestrosCerrados = grupo.siniestros.filter(s => s.estado === 'cerrado').length;
                  const isSelected = selectedIds.includes(grupo.id);

                  return (
                    <tr
                      key={grupo.id}
                      className={cn(
                        "hover:bg-slate-50/50 transition-colors",
                        isSelected && "bg-slate-50"
                      )}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSeleccion(grupo.id)}
                        />
                      </td>

                      {/* Empresa */}
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
                            <span className="text-white font-semibold text-sm">
                              {grupo.empresa.nombre.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <button
                              onClick={() => handleOpenTable(grupo)}
                              className="font-semibold text-slate-900 hover:text-blue-600 transition-colors text-left"
                            >
                              {grupo.empresa.nombre}
                            </button>
                            {grupo.empresa.direccion && (
                              <p className="text-xs text-slate-500 mt-0.5">
                                {grupo.empresa.direccion}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Observaciones */}
                      <td className="px-4 py-3">
                        {observacionesEditando === grupo.id ? (
                          <Input
                            value={observacionesValue}
                            onChange={(e) => setObservacionesValue(e.target.value)}
                            onBlur={() => handleSaveObservaciones(grupo.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveObservaciones(grupo.id);
                            }}
                            placeholder="Añadir observaciones..."
                            className="h-8 text-sm"
                            autoFocus
                          />
                        ) : (
                          <button
                            onClick={() => handleStartEditing(grupo)}
                            className={cn(
                              "text-left text-sm transition-colors",
                              grupo.observacionesGenerales
                                ? "text-slate-700 hover:text-slate-900"
                                : "text-slate-400 hover:text-slate-600 italic"
                            )}
                          >
                            {grupo.observacionesGenerales || "Añadir observaciones..."}
                          </button>
                        )}
                      </td>

                      {/* Siniestros */}
                      <td className="px-4 py-3 text-center">
                        {grupo.siniestros.length > 0 ? (
                          <div className="flex items-center justify-center gap-2">
                            <Badge
                              variant="secondary"
                              className={cn(
                                "font-medium",
                                siniestrosAbiertos > 0
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              )}
                            >
                              {grupo.siniestros.length}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-3 text-center">
                        {grupo.siniestros.length > 0 ? (
                          <div className="flex items-center justify-center gap-3">
                            {siniestrosCerrados > 0 && (
                              <div className="flex items-center gap-1 text-xs text-slate-600">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                {siniestrosCerrados}
                              </div>
                            )}
                            {siniestrosAbiertos > 0 && (
                              <div className="flex items-center gap-1 text-xs text-slate-600">
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                {siniestrosAbiertos}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Sin siniestros</span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDownloadGrupo(grupo)}
                            title="Descargar PDF"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenTable(grupo)}
                            title="Ver tabla"
                          >
                            <FileText className="w-4 h-4" />
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
                                Ver tabla completa
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownloadGrupo(grupo)}>
                                <Download className="w-4 h-4 mr-2" />
                                Descargar PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
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
                  );
                })}
              </tbody>
            </table>
          </div>
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
