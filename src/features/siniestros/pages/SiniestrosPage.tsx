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
  Filter,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
  ChevronRight,
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

  const hasActiveFilters = filtros.search || filtros.estado || filtros.valoracion;

  return (
    <div className="h-full flex flex-col p-6 bg-gradient-to-br from-slate-50/50 to-slate-100/30">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <FileWarning className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Siniestros</h1>
              <p className="text-sm text-slate-500">
                Gestión de historiales y seguimiento de siniestros
              </p>
            </div>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total clientes */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Clientes con historial</p>
              <p className="text-3xl font-bold text-slate-900">{metricas.totalClientes}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-500">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
            Registrados en el sistema
          </div>
        </div>

        {/* Siniestros abiertos */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Siniestros abiertos</p>
              <p className="text-3xl font-bold text-amber-600">{metricas.siniestrosAbiertos}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-500">
            <AlertCircle className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
            Requieren atención
          </div>
        </div>

        {/* Total siniestros */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total siniestros</p>
              <p className="text-3xl font-bold text-slate-900">
                {grupos.reduce((acc, g) => acc + g.siniestros.length, 0)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-500">
            <span className="text-emerald-600 font-medium">
              {grupos.reduce((acc, g) => acc + g.siniestros.filter(s => s.estado === 'cerrado').length, 0)}
            </span>
            <span className="ml-1">cerrados</span>
          </div>
        </div>

        {/* Ratio */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Ratio apertura</p>
              <p className="text-3xl font-bold text-slate-900">
                {metricas.totalClientes > 0
                  ? Math.round((metricas.siniestrosAbiertos / grupos.reduce((acc, g) => acc + g.siniestros.length, 0)) * 100) || 0
                  : 0}%
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-500">
            <span className="text-slate-400">De siniestros totales</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Búsqueda */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar empresa..."
              value={filtros.search || ''}
              onChange={(e) => setFiltros({ search: e.target.value })}
              className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
            />
          </div>

          {/* Filtros dropdown */}
          <div className="flex gap-3">
            <Select
              value={filtros.estado || '__all__'}
              onValueChange={(v) =>
                setFiltros({ estado: v === '__all__' ? undefined : (v as any) })
              }
            >
              <SelectTrigger className="w-[160px] h-11 bg-slate-50 border-slate-200">
                <Filter className="w-4 h-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
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
                setFiltros({ valoracion: v === '__all__' ? undefined : (v as any) })
              }
            >
              <SelectTrigger className="w-[180px] h-11 bg-slate-50 border-slate-200">
                <SelectValue placeholder="Valoración" />
              </SelectTrigger>
              <SelectContent>
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
                className="h-11 w-11 text-slate-400 hover:text-slate-600"
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
        <div className="flex items-center justify-between gap-4 mb-4 p-4 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="font-medium">
              {selectedIds.length} {selectedIds.length === 1 ? 'empresa seleccionada' : 'empresas seleccionadas'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/10"
              onClick={deseleccionarTodos}
            >
              Cancelar
            </Button>
            <Button
              className="bg-white text-slate-900 hover:bg-white/90"
              onClick={handleDownloadSelected}
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar PDFs
            </Button>
          </div>
        </div>
      )}

      {/* Lista de grupos */}
      {gruposFiltrados.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-6 shadow-inner">
            <FileText className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            {hasActiveFilters ? 'No se encontraron resultados' : 'No hay historiales de siniestros'}
          </h3>
          <p className="text-slate-500 mb-6 max-w-sm">
            {hasActiveFilters
              ? 'Prueba con otros filtros de búsqueda o limpia los filtros actuales.'
              : 'Crea un nuevo historial seleccionando un cliente existente del CRM para comenzar.'}
          </p>
          {hasActiveFilters ? (
            <Button variant="outline" onClick={() => setFiltros({})}>
              Limpiar filtros
            </Button>
          ) : (
            <Button
              onClick={() => setIsClienteSelectorOpen(true)}
              className="bg-gradient-to-r from-slate-900 to-slate-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear primer historial
            </Button>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {gruposFiltrados.map((grupo) => {
              const siniestrosAbiertos = grupo.siniestros.filter(s => s.estado === 'abierto').length;
              const siniestrosCerrados = grupo.siniestros.filter(s => s.estado === 'cerrado').length;
              const isSelected = selectedIds.includes(grupo.id);

              return (
                <div
                  key={grupo.id}
                  className={cn(
                    "group bg-white rounded-2xl p-5 border transition-all duration-200 cursor-pointer",
                    isSelected
                      ? "border-slate-900 shadow-lg shadow-slate-900/10"
                      : "border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300"
                  )}
                  onClick={() => handleOpenTable(grupo)}
                >
                  {/* Header de la card */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div
                        className="mt-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSeleccion(grupo.id);
                        }}
                      >
                        <Checkbox checked={isSelected} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">
                          {grupo.empresa.nombre}
                        </h3>
                        {grupo.empresa.direccion && (
                          <p className="text-sm text-slate-500 mt-0.5">
                            {grupo.empresa.direccion}
                          </p>
                        )}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleOpenTable(grupo);
                        }}>
                          <FileText className="w-4 h-4 mr-2" />
                          Ver tabla completa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadGrupo(grupo);
                        }}>
                          <Download className="w-4 h-4 mr-2" />
                          Descargar PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteGrupo(grupo.id, grupo.empresa.nombre);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar historial
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Métricas del grupo */}
                  <div className="flex items-center gap-2 mb-4">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "font-medium",
                        grupo.siniestros.length === 0 && "bg-slate-100 text-slate-600",
                        siniestrosAbiertos > 0 && "bg-amber-50 text-amber-700 border-amber-200",
                        grupo.siniestros.length > 0 && siniestrosAbiertos === 0 && "bg-emerald-50 text-emerald-700 border-emerald-200"
                      )}
                    >
                      {grupo.siniestros.length === 0 ? (
                        "Sin siniestros"
                      ) : (
                        <>
                          {grupo.siniestros.length} siniestro{grupo.siniestros.length !== 1 ? 's' : ''}
                          {siniestrosAbiertos > 0 && ` · ${siniestrosAbiertos} abierto${siniestrosAbiertos !== 1 ? 's' : ''}`}
                        </>
                      )}
                    </Badge>
                  </div>

                  {/* Observaciones */}
                  <div
                    className="mb-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {observacionesEditando === grupo.id ? (
                      <Input
                        value={grupo.observacionesGenerales}
                        onChange={(e) => handleUpdateObservaciones(grupo.id, e.target.value)}
                        onBlur={() => setObservacionesEditando(null)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') setObservacionesEditando(null);
                        }}
                        placeholder="Añadir observaciones..."
                        className="h-9 text-sm bg-slate-50"
                        autoFocus
                      />
                    ) : (
                      <button
                        onClick={() => setObservacionesEditando(grupo.id)}
                        className={cn(
                          "w-full text-left text-sm px-3 py-2 rounded-lg border border-dashed transition-colors",
                          grupo.observacionesGenerales
                            ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                            : "bg-slate-50/50 border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                        )}
                      >
                        {grupo.observacionesGenerales || "Añadir observaciones generales..."}
                      </button>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-4">
                      {grupo.siniestros.length > 0 && (
                        <>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-sm text-slate-600">{siniestrosCerrados}</span>
                          </div>
                          {siniestrosAbiertos > 0 && (
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-amber-500" />
                              <span className="text-sm text-slate-600">{siniestrosAbiertos}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-500 hover:text-slate-900"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenTable(grupo);
                      }}
                    >
                      Ver detalle
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              );
            })}
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
