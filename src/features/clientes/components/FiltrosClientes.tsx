import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, X, SlidersHorizontal, ChevronDown, Columns2 } from 'lucide-react';
import { useClientesStore } from '../store/clientes.store';
import type { EstadoCliente, TipoCarga, Transporte } from '@/types';
import { enumToLabel } from '@/lib/formatters';
import { ChipMes } from '@/components/shared/ChipMes';
import { useQuery } from '@tanstack/react-query';
import { dataProvider } from '@/config/dataProvider';
import type { ColumnVisibility } from './ColumnVisibilityMenu';

const estados: EstadoCliente[] = ['contratado', 'contactado_buena_pinta', 'en_negociacion', 'descartado'];
const tiposCarga: TipoCarga[] = [
  'general_fraccionada',
  'frigorifica',
  'adr_peligrosas',
  'completa_ftl',
  'fraccionada_ltl',
  'a_granel',
  'vehiculos',
];
const transportes: Transporte[] = ['nacional', 'internacional', 'peninsular'];
const meses = Array.from({ length: 12 }, (_, i) => i + 1);

interface FiltrosContentProps {
  onClose?: () => void;
  columnVisibility?: ColumnVisibility;
  onColumnsChange?: (columns: ColumnVisibility) => void;
}

function FiltrosContent({ onClose, columnVisibility, onColumnsChange }: FiltrosContentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filtros, setFiltros } = useClientesStore();
  const { data: config } = useQuery({
    queryKey: ['config'],
    queryFn: () => dataProvider.getConfig(),
  });

  useEffect(() => {
    const search = searchParams.get('search') || '';
    const estadosParam = searchParams.get('estados')?.split(',').filter(Boolean) as EstadoCliente[] | undefined;
    const tiposCargaParam = searchParams.get('tiposCarga')?.split(',').filter(Boolean) as TipoCarga[] | undefined;
    const transportesParam = searchParams.get('transportes')?.split(',').filter(Boolean) as Transporte[] | undefined;
    const mesParam = searchParams.get('mesVencimiento') ? Number(searchParams.get('mesVencimiento')) : undefined;

    setFiltros({
      search: search || undefined,
      estados: estadosParam,
      tiposCarga: tiposCargaParam,
      transportes: transportesParam,
      mesVencimiento: mesParam,
    });
  }, [searchParams, setFiltros]);

  const updateURL = (newFiltros: typeof filtros) => {
    const params = new URLSearchParams();
    if (newFiltros.search) params.set('search', newFiltros.search);
    if (newFiltros.estados?.length) params.set('estados', newFiltros.estados.join(','));
    if (newFiltros.tiposCarga?.length) params.set('tiposCarga', newFiltros.tiposCarga.join(','));
    if (newFiltros.transportes?.length) params.set('transportes', newFiltros.transportes.join(','));
    if (newFiltros.mesVencimiento) params.set('mesVencimiento', String(newFiltros.mesVencimiento));
    setSearchParams(params, { replace: true });
  };

  const handleSearchChange = (value: string) => {
    const newFiltros = { ...filtros, search: value || undefined };
    setFiltros(newFiltros);
    updateURL(newFiltros);
  };

  const toggleEstado = (estado: EstadoCliente) => {
    const current = filtros.estados || [];
    const newEstados = current.includes(estado)
      ? current.filter((e) => e !== estado)
      : [...current, estado];
    const newFiltros = { ...filtros, estados: newEstados.length > 0 ? newEstados : undefined };
    setFiltros(newFiltros);
    updateURL(newFiltros);
  };

  const toggleTipoCarga = (tipo: TipoCarga) => {
    const current = filtros.tiposCarga || [];
    const newTipos = current.includes(tipo)
      ? current.filter((t) => t !== tipo)
      : [...current, tipo];
    const newFiltros = { ...filtros, tiposCarga: newTipos.length > 0 ? newTipos : undefined };
    setFiltros(newFiltros);
    updateURL(newFiltros);
  };

  const toggleTransporte = (transporte: Transporte) => {
    const current = filtros.transportes || [];
    const newTransportes = current.includes(transporte)
      ? current.filter((t) => t !== transporte)
      : [...current, transporte];
    const newFiltros = { ...filtros, transportes: newTransportes.length > 0 ? newTransportes : undefined };
    setFiltros(newFiltros);
    updateURL(newFiltros);
  };

  const handleMesChange = (mes: string) => {
    const mesNum = mes === 'all' ? undefined : Number(mes);
    const newFiltros = { ...filtros, mesVencimiento: mesNum };
    setFiltros(newFiltros);
    updateURL(newFiltros);
  };

  const resetFiltros = () => {
    setFiltros({});
    setSearchParams({}, { replace: true });
    onClose?.();
  };

  const hasActiveFilters = !!(
    filtros.search ||
    filtros.estados?.length ||
    filtros.tiposCarga?.length ||
    filtros.transportes?.length ||
    filtros.mesVencimiento
  );

  const estadosCount = filtros.estados?.length || 0;
  const tiposCargaCount = filtros.tiposCarga?.length || 0;
  const transportesCount = filtros.transportes?.length || 0;

  // Si hay onClose, significa que está en el Sheet (móvil), usar layout vertical
  const isMobile = !!onClose;

  return (
    <div className={isMobile ? "space-y-4" : "flex items-center gap-2 flex-wrap w-full"}>
      {/* Search */}
      <div className={isMobile ? "relative w-full" : "relative flex-1 min-w-[200px] max-w-[400px]"}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="search"
          placeholder="Buscar..."
          value={filtros.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      {/* Estado - Multi Select Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={`h-9 gap-2 ${isMobile ? 'w-full justify-between' : ''}`}>
            Estado
            {estadosCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {estadosCount}
              </Badge>
            )}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Estado</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={filtros.estados?.includes('sin_definir' as any) || false}
            onCheckedChange={() => toggleEstado('sin_definir' as any)}
          >
            Sin definir
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          {estados.map((estado) => (
            <DropdownMenuCheckboxItem
              key={estado}
              checked={filtros.estados?.includes(estado) || false}
              onCheckedChange={() => toggleEstado(estado)}
            >
              {enumToLabel.estado[estado]}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Mercancía - Multi Select Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={`h-9 gap-2 ${isMobile ? 'w-full justify-between' : ''}`}>
            Mercancía
            {tiposCargaCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {tiposCargaCount}
              </Badge>
            )}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Mercancía</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={filtros.tiposCarga?.includes('sin_definir' as any) || false}
            onCheckedChange={() => toggleTipoCarga('sin_definir' as any)}
          >
            Sin definir
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          {tiposCarga.map((tipo) => (
            <DropdownMenuCheckboxItem
              key={tipo}
              checked={filtros.tiposCarga?.includes(tipo) || false}
              onCheckedChange={() => toggleTipoCarga(tipo)}
            >
              {enumToLabel.tipoCarga[tipo as keyof typeof enumToLabel.tipoCarga]}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Transporte - Multi Select Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={`h-9 gap-2 ${isMobile ? 'w-full justify-between' : ''}`}>
            Transporte
            {transportesCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {transportesCount}
              </Badge>
            )}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Transporte</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={filtros.transportes?.includes('sin_definir' as any) || false}
            onCheckedChange={() => toggleTransporte('sin_definir' as any)}
          >
            Sin definir
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          {transportes.map((transporte) => (
            <DropdownMenuCheckboxItem
              key={transporte}
              checked={filtros.transportes?.includes(transporte) || false}
              onCheckedChange={() => toggleTransporte(transporte)}
            >
              {enumToLabel.transporte[transporte]}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Mes Vencimiento - Select con chips */}
      <Select
        value={filtros.mesVencimiento ? String(filtros.mesVencimiento) : 'all'}
        onValueChange={handleMesChange}
      >
        <SelectTrigger className={isMobile ? "h-9 w-full" : "h-9 w-[180px]"}>
          <SelectValue placeholder="Mes Vencimiento" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los meses</SelectItem>
          {meses.map((mes) => {
            const fecha = new Date(2000, mes - 1, 1);
            const mesNombre = fecha.toLocaleDateString('es-ES', { month: 'long' });
            return (
              <SelectItem key={mes} value={String(mes)}>
                <div className="flex items-center gap-2">
                  <ChipMes fecha={fecha} config={config} />
                  <span className="capitalize">{mesNombre}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={resetFiltros} className={`h-9 gap-2 ${isMobile ? 'w-full' : ''}`}>
          <X className="h-4 w-4" />
          Limpiar filtros
        </Button>
      )}

      {/* Column Visibility Selector */}
      {columnVisibility && onColumnsChange && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className={`h-9 gap-2 ${isMobile ? 'w-full justify-between' : ''}`}>
              <Columns2 className="h-4 w-4" />
              <span>Columnas</span>
              {!isMobile && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {Object.values(columnVisibility).filter(Boolean).length}
                </Badge>
              )}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Mostrar columnas</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={columnVisibility.empresa}
              onCheckedChange={() => onColumnsChange({ ...columnVisibility, empresa: !columnVisibility.empresa })}
            >
              Empresa / Contacto
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.telefono}
              onCheckedChange={() => onColumnsChange({ ...columnVisibility, telefono: !columnVisibility.telefono })}
            >
              Teléfono
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.correo}
              onCheckedChange={() => onColumnsChange({ ...columnVisibility, correo: !columnVisibility.correo })}
            >
              Correo
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.estado}
              onCheckedChange={() => onColumnsChange({ ...columnVisibility, estado: !columnVisibility.estado })}
            >
              Estado
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.mercancia}
              onCheckedChange={() => onColumnsChange({ ...columnVisibility, mercancia: !columnVisibility.mercancia })}
            >
              Mercancía
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.transporte}
              onCheckedChange={() => onColumnsChange({ ...columnVisibility, transporte: !columnVisibility.transporte })}
            >
              Transporte
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.vencimientos}
              onCheckedChange={() => onColumnsChange({ ...columnVisibility, vencimientos: !columnVisibility.vencimientos })}
            >
              Vencimientos
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.facturacion}
              onCheckedChange={() => onColumnsChange({ ...columnVisibility, facturacion: !columnVisibility.facturacion })}
            >
              Facturación
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.fechaLlamada}
              onCheckedChange={() => onColumnsChange({ ...columnVisibility, fechaLlamada: !columnVisibility.fechaLlamada })}
            >
              Fecha de Llamada
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.numVehiculos}
              onCheckedChange={() => onColumnsChange({ ...columnVisibility, numVehiculos: !columnVisibility.numVehiculos })}
            >
              Número de Vehículos
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

interface FiltrosClientesProps {
  columnVisibility?: ColumnVisibility;
  onColumnsChange?: (columns: ColumnVisibility) => void;
}

export function FiltrosClientes({ columnVisibility, onColumnsChange }: FiltrosClientesProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { filtros } = useClientesStore();

  const activeFiltersCount = [
    filtros.search,
    filtros.estados?.length,
    filtros.tiposCarga?.length,
    filtros.transportes?.length,
    filtros.mesVencimiento,
  ].filter(Boolean).length;

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block w-full">
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border w-full">
          <FiltrosContent columnVisibility={columnVisibility} onColumnsChange={onColumnsChange} />
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[90vw] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FiltrosContent
                onClose={() => setSheetOpen(false)}
                columnVisibility={columnVisibility}
                onColumnsChange={onColumnsChange}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
