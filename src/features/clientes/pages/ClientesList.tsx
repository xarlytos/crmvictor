import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight, PackageSearch } from 'lucide-react';
import { KPI } from '@/components/shared/KPI';
import { FiltrosClientes } from '../components/FiltrosClientes';
import { ClienteRow } from '../components/ClienteRow';
import { ClienteFormDrawer } from '../components/ClienteFormDrawer';
import { BulkBar } from '../components/BulkBar';
import type { ColumnVisibility } from '../components/ColumnVisibilityMenu';
import { DataTable, DataTableContent, DataTableHeaderCell } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { dataProvider } from '@/config/dataProvider';
import { useClientesStore } from '../store/clientes.store';
import type { Cliente, EstadoCliente } from '@/types';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { Users, TrendingUp, Calendar, FileText } from 'lucide-react';
import { getDaysUntil } from '@/lib/date';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { TooltipProvider } from '@/components/ui/tooltip';

type SortField = 'empresa' | 'vencimientos' | 'estado' | 'createdAt';
type SortDirection = 'asc' | 'desc' | null;

export function ClientesList() {
  const { filtros } = useClientesStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Cliente | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
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
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: config } = useQuery({
    queryKey: ['config'],
    queryFn: () => dataProvider.getConfig(),
  });

  const { data: clientesData, isLoading, error } = useQuery({
    queryKey: ['clientes', filtros],
    queryFn: () => dataProvider.listClientes(filtros),
  });

  // Sort and paginate
  const sortedAndPaginated = useMemo(() => {
    if (!clientesData?.items) return { items: [], total: 0 };

    let sorted = [...clientesData.items];

    if (sortField && sortDirection) {
      sorted.sort((a, b) => {
        let aVal: any;
        let bVal: any;

        switch (sortField) {
          case 'empresa':
            aVal = a.empresa.toLowerCase();
            bVal = b.empresa.toLowerCase();
            break;
          case 'vencimientos':
            aVal = a.vencimientos?.flotas || a.vencimientos?.mercancias || a.poliza?.fechaFin;
            bVal = b.vencimientos?.flotas || b.vencimientos?.mercancias || b.poliza?.fechaFin;
            aVal = aVal ? new Date(aVal).getTime() : 0;
            bVal = bVal ? new Date(bVal).getTime() : 0;
            break;
          case 'estado':
            aVal = a.estado;
            bVal = b.estado;
            break;
          case 'createdAt':
            aVal = new Date(a.createdAt).getTime();
            bVal = new Date(b.createdAt).getTime();
            break;
          default:
            return 0;
        }

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    const total = sorted.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginated = sorted.slice(start, end);

    return { items: paginated, total };
  }, [clientesData, sortField, sortDirection, page, pageSize]);

  const clientes = sortedAndPaginated.items;
  const total = clientesData?.total || 0;

  const createMutation = useMutation({
    mutationFn: (data: Partial<Cliente>) => dataProvider.createCliente(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['clientes-filtros'] });
      queryClient.invalidateQueries({ queryKey: ['vencimientos'] });
      toast({
        title: 'Cliente creado',
        description: 'El cliente se ha creado correctamente.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al crear el cliente',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Cliente> }) =>
      dataProvider.updateCliente(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['clientes-filtros'] });
      queryClient.invalidateQueries({ queryKey: ['vencimientos'] });
      toast({
        title: 'Cliente actualizado',
        description: 'El cliente se ha actualizado correctamente.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al actualizar el cliente',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => dataProvider.deleteCliente(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['clientes-filtros'] });
      queryClient.invalidateQueries({ queryKey: ['vencimientos'] });
      toast({
        title: 'Cliente eliminado',
        description: 'El cliente se ha eliminado correctamente.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al eliminar el cliente',
        variant: 'destructive',
      });
    },
  });

  const handleCreate = () => {
    setEditingCliente(null);
    setDrawerOpen(true);
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setDrawerOpen(true);
  };

  const handleSubmit = async (data: Partial<Cliente>) => {
    if (editingCliente) {
      await updateMutation.mutateAsync({ id: editingCliente.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
    setDrawerOpen(false);
  };

  const handleBulkEstadoChange = async (estado: EstadoCliente) => {
    const promises = Array.from(selectedIds).map((id) => {
      const cliente = clientesData?.items.find((c) => c.id === id);
      if (cliente) {
        return updateMutation.mutateAsync({
          id,
          data: { estado },
        });
      }
    });
    await Promise.all(promises.filter(Boolean));
    setSelectedIds(new Set());
    toast({
      title: 'Estados actualizados',
      description: `Se actualizaron ${selectedIds.size} clientes.`,
    });
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      await deleteMutation.mutateAsync(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  const handleDeleteCliente = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    const count = selectedIds.size;
    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar ${count} ${count === 1 ? 'cliente' : 'clientes'}? Esta acción no se puede deshacer.`
    );

    if (!confirmDelete) return;

    const promises = Array.from(selectedIds).map((id) => deleteMutation.mutateAsync(id));
    await Promise.all(promises);
    setSelectedIds(new Set());
    toast({
      title: 'Clientes eliminados',
      description: `Se eliminaron ${count} ${count === 1 ? 'cliente' : 'clientes'} correctamente.`,
    });
  };

  const handleBulkExportPDF = () => {
    if (selectedIds.size === 0) return;

    const selectedClientes = clientesData?.items.filter((c) => selectedIds.has(c.id)) || [];
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Título
    doc.setFontSize(18);
    doc.text('Listado de Clientes', pageWidth / 2, 20, { align: 'center' });
    
    // Fecha
    doc.setFontSize(10);
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, 28, { align: 'center' });
    
    let y = 40;
    
    selectedClientes.forEach((cliente, index) => {
      // Verificar si necesitamos nueva página
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      
      // Nombre de empresa
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${cliente.empresa}`, 14, y);
      y += 8;
      
      // Datos de contacto
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      if (cliente.correo) {
        doc.text(`Email: ${cliente.correo}`, 20, y);
        y += 6;
      }
      
      if (cliente.telefono) {
        doc.text(`Tel: ${cliente.telefono}`, 20, y);
        y += 6;
      }
      
      // Estado
      const estadoLabels: Record<string, string> = {
        contratado: 'Contratado',
        en_negociacion: 'En negociación',
        pendiente: 'Pendiente',
        baja: 'Baja',
        contactado_buena_pinta: 'Contactado (buena pinta)',
        descartado: 'Descartado',
      };
      const estadoLabel = cliente.estado ? estadoLabels[cliente.estado] || cliente.estado : 'Sin estado';
      doc.text(`Estado: ${estadoLabel}`, 20, y);
      y += 6;
      
      // Vencimientos
      const vencimientos: string[] = [];
      if (cliente.vencimientos?.rc) vencimientos.push(`RC: ${new Date(cliente.vencimientos.rc).toLocaleDateString('es-ES')}`);
      if (cliente.vencimientos?.mercancias) vencimientos.push(`Mercancías: ${new Date(cliente.vencimientos.mercancias).toLocaleDateString('es-ES')}`);
      if (cliente.vencimientos?.acc) vencimientos.push(`ACC: ${new Date(cliente.vencimientos.acc).toLocaleDateString('es-ES')}`);
      if (cliente.vencimientos?.flotas) vencimientos.push(`Flotas: ${new Date(cliente.vencimientos.flotas).toLocaleDateString('es-ES')}`);
      if (cliente.vencimientos?.pyme) vencimientos.push(`PYME: ${new Date(cliente.vencimientos.pyme).toLocaleDateString('es-ES')}`);
      
      if (vencimientos.length > 0) {
        doc.text(`Vencimientos: ${vencimientos.join(', ')}`, 20, y);
        y += 6;
      }
      
      // Separador
      y += 4;
      doc.setDrawColor(200, 200, 200);
      doc.line(14, y, pageWidth - 14, y);
      y += 8;
    });
    
    doc.save(`clientes-${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: 'PDF generado',
      description: `Se exportaron ${selectedClientes.length} clientes al PDF.`,
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleSelection = (id: string, selected: boolean) => {
    const newSet = new Set(selectedIds);
    if (selected) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(clientes.map((c) => c.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const isAllSelected = clientes.length > 0 && clientes.every((c) => selectedIds.has(c.id));
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < clientes.length;

  // KPIs
  const contratados = clientesData?.items.filter((c) => c.estado === 'contratado').length || 0;
  const tasaCierre = total > 0 ? ((contratados / total) * 100).toFixed(1) : '0';
  const proximosVencimientos = clientesData?.items.filter((c) => {
    const dates = [
      c.poliza?.fechaFin,
      c.vencimientos?.rc,
      c.vencimientos?.mercancias,
      c.vencimientos?.acc,
      c.vencimientos?.flotas,
      c.vencimientos?.pyme,
    ].filter(Boolean) as string[];

    return dates.some(d => {
      const dias = getDaysUntil(d);
      return dias >= 0 && dias <= 60;
    });
  }).length || 0;
  const enNegociacion = clientesData?.items.filter((c) => c.estado === 'en_negociacion').length || 0;

  const totalPages = Math.ceil(sortedAndPaginated.total / pageSize);

  return (
    <TooltipProvider>
      <div className="space-y-6 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Clientes</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gestiona tus clientes y controla sus vencimientos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleCreate} className="rounded-lg gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Cliente
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPI
            title="Total Clientes"
            value={total}
            icon={<Users className="h-4 w-4 text-muted-foreground/60" />}
          />
          <KPI
            title="Contratados"
            value={contratados}
            subtitle={`${tasaCierre}% tasa de cierre`}
            icon={<TrendingUp className="h-4 w-4 text-muted-foreground/60" />}
          />
          <KPI
            title="Próximos Vencimientos"
            value={proximosVencimientos}
            subtitle="En los próximos 60 días"
            icon={<Calendar className="h-4 w-4 text-muted-foreground/60" />}
          />
          <KPI
            title="En Negociación"
            value={enNegociacion}
            icon={<FileText className="h-4 w-4 text-muted-foreground/60" />}
          />
        </div>

        {/* Toolbar de Filtros */}
        <FiltrosClientes
          columnVisibility={columnVisibility}
          onColumnsChange={setColumnVisibility}
        />

        {/* Tabla */}
        <DataTable>
          <DataTableContent>
            <table className="w-full table-auto">
              <thead className="sticky top-0 z-10 bg-muted/30 border-b border-border backdrop-blur-sm">
                <tr>
                  <th className="w-12 px-5 py-4">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeSelected;
                      }}
                      onChange={(e) => toggleSelectAll(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                      aria-label="Seleccionar todos"
                    />
                  </th>
                  {columnVisibility.empresa && (
                    <DataTableHeaderCell
                      sortable
                      sortDirection={sortField === 'empresa' ? sortDirection : null}
                      onSort={() => handleSort('empresa')}
                      aria-sort={sortField === 'empresa' ? (sortDirection === 'asc' ? 'ascending' : sortDirection === 'desc' ? 'descending' : 'none') : 'none'}
                      className="min-w-[300px]"
                    >
                      Empresa / Contacto
                    </DataTableHeaderCell>
                  )}
                  {columnVisibility.telefono && (
                    <DataTableHeaderCell className="w-[150px]">
                      Teléfono
                    </DataTableHeaderCell>
                  )}
                  {columnVisibility.correo && (
                    <DataTableHeaderCell className="w-[280px] max-w-[280px]">
                      Correo
                    </DataTableHeaderCell>
                  )}
                  {columnVisibility.estado && (
                    <DataTableHeaderCell
                      sortable
                      sortDirection={sortField === 'estado' ? sortDirection : null}
                      onSort={() => handleSort('estado')}
                      aria-sort={sortField === 'estado' ? (sortDirection === 'asc' ? 'ascending' : sortDirection === 'desc' ? 'descending' : 'none') : 'none'}
                      className="w-[200px]"
                    >
                      Estado
                    </DataTableHeaderCell>
                  )}
                  {columnVisibility.mercancia && (
                    <DataTableHeaderCell className="w-[200px]">
                      Mercancía
                    </DataTableHeaderCell>
                  )}
                  {columnVisibility.transporte && (
                    <DataTableHeaderCell className="w-[140px]">
                      Transporte
                    </DataTableHeaderCell>
                  )}
                  {columnVisibility.vencimientos && (
                    <DataTableHeaderCell
                      sortable
                      sortDirection={sortField === 'vencimientos' ? sortDirection : null}
                      onSort={() => handleSort('vencimientos')}
                      aria-sort={sortField === 'vencimientos' ? (sortDirection === 'asc' ? 'ascending' : sortDirection === 'desc' ? 'descending' : 'none') : 'none'}
                      className="w-[320px]"
                    >
                      Vencimientos
                    </DataTableHeaderCell>
                  )}
                  {columnVisibility.facturacion && (
                    <DataTableHeaderCell className="w-[120px] text-right">
                      Facturación
                    </DataTableHeaderCell>
                  )}
                  {columnVisibility.fechaLlamada && (
                    <DataTableHeaderCell className="w-[160px]">
                      Fecha de Llamada
                    </DataTableHeaderCell>
                  )}
                  {columnVisibility.numVehiculos && (
                    <DataTableHeaderCell className="w-[150px]">
                      Número de Vehículos
                    </DataTableHeaderCell>
                  )}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="h-20 border-b">
                      <td colSpan={Object.values(columnVisibility).filter(Boolean).length + 1} className="px-5 py-4">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={Object.values(columnVisibility).filter(Boolean).length + 1} className="px-5 py-8 text-center text-destructive">
                      Error: {error instanceof Error ? error.message : 'Error desconocido'}
                    </td>
                  </tr>
                ) : clientes.length === 0 ? (
                  <tr>
                    <td colSpan={Object.values(columnVisibility).filter(Boolean).length + 1} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <PackageSearch className="h-12 w-12 text-muted-foreground/50" />
                        <div>
                          <p className="text-lg font-medium">No se encontraron clientes</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {Object.keys(filtros).length > 0
                              ? 'Intenta ajustar los filtros para ver más resultados'
                              : 'Comienza agregando tu primer cliente'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleCreate} variant="default">
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Cliente
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  clientes.map((cliente) => (
                    <ClienteRow
                      key={cliente.id}
                      cliente={cliente}
                      config={config}
                      selected={selectedIds.has(cliente.id)}
                      onSelect={(selected) => toggleSelection(cliente.id, selected)}
                      onEdit={handleEdit}
                      columnVisibility={columnVisibility}
                    />
                  ))
                )}
              </tbody>
            </table>
          </DataTableContent>
        </DataTable>

        {/* Paginación */}
        {!isLoading && clientes.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                Mostrando {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, sortedAndPaginated.total)} de {sortedAndPaginated.total}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Select value={String(pageSize)} onValueChange={(v) => {
                setPageSize(Number(v));
                setPage(1);
              }}>
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Página anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm px-2">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                aria-label="Página siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Bulk Actions Bar */}
        <BulkBar
          selectedCount={selectedIds.size}
          onClearSelection={() => setSelectedIds(new Set())}
          onBulkEstadoChange={handleBulkEstadoChange}
          onBulkExport={handleBulkExportPDF}
          onBulkDelete={handleBulkDelete}
        />

        {/* Drawer */}
        <ClienteFormDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          cliente={editingCliente}
          onSubmit={handleSubmit}
          onDelete={handleDeleteCliente}
        />

        {/* Delete Confirm */}
        <ConfirmDialog
          open={!!deleteConfirm}
          onOpenChange={(open) => !open && setDeleteConfirm(null)}
          title="Eliminar Cliente"
          description={`¿Estás seguro de que deseas eliminar a ${deleteConfirm?.empresa}? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          onConfirm={handleDelete}
          variant="destructive"
        />
      </div>
    </TooltipProvider>
  );
}
