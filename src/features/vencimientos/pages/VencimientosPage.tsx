import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { dataProvider } from '@/config/dataProvider';
import { formatDate, getDaysUntil } from '@/lib/date';
import { ChipMes } from '@/components/shared/ChipMes';
import { EstadoBadge } from '@/components/shared/EstadoBadge';
import { Phone, Mail, ExternalLink, CalendarDays, Filter, AlertCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { EstadoCliente, Cliente } from '@/types';

const estadoLabels: Record<EstadoCliente, string> = {
  llamado: 'Llamado',
  gmail_enviado: 'Gmail enviado',
  reunido: 'Reunido',
  propuesta_activa: 'Propuesta activa',
  vendido: 'Vendido',
  no_llegamos: 'No llegamos',
};

export function VencimientosPage() {
  const [rangoDias, setRangoDias] = useState<string>('all');
  const [mes, setMes] = useState<string>('all');
  const [estado, setEstado] = useState<EstadoCliente | 'all'>('all');

  const { data: config } = useQuery({
    queryKey: ['config'],
    queryFn: () => dataProvider.getConfig(),
  });

  // Obtener todos los clientes para extraer todos los vencimientos
  const { data: clientesData } = useQuery({
    queryKey: ['clientes', 'all'],
    queryFn: () => dataProvider.listClientes(),
  });

  // Extraer TODOS los vencimientos de todos los clientes (estándar + personalizados)
  const todosVencimientos = useMemo(() => {
    if (!clientesData?.items) return [];
    
    const vencimientos: Array<{
      cliente: Cliente;
      tipo: string;
      fecha: string;
      dias: number;
      esPersonalizado: boolean;
    }> = [];
    

    
    clientesData.items.forEach((cliente) => {
      // Vencimientos estándar
      if (cliente.vencimientos?.rc) {
        vencimientos.push({
          cliente,
          tipo: 'rc',
          fecha: cliente.vencimientos.rc,
          dias: getDaysUntil(cliente.vencimientos.rc),
          esPersonalizado: false,
        });
      }
      if (cliente.vencimientos?.mercancias) {
        vencimientos.push({
          cliente,
          tipo: 'mercancias',
          fecha: cliente.vencimientos.mercancias,
          dias: getDaysUntil(cliente.vencimientos.mercancias),
          esPersonalizado: false,
        });
      }
      if (cliente.vencimientos?.acc) {
        vencimientos.push({
          cliente,
          tipo: 'acc',
          fecha: cliente.vencimientos.acc,
          dias: getDaysUntil(cliente.vencimientos.acc),
          esPersonalizado: false,
        });
      }
      if (cliente.vencimientos?.flotas) {
        vencimientos.push({
          cliente,
          tipo: 'flotas',
          fecha: cliente.vencimientos.flotas,
          dias: getDaysUntil(cliente.vencimientos.flotas),
          esPersonalizado: false,
        });
      }
      if (cliente.vencimientos?.pyme) {
        vencimientos.push({
          cliente,
          tipo: 'pyme',
          fecha: cliente.vencimientos.pyme,
          dias: getDaysUntil(cliente.vencimientos.pyme),
          esPersonalizado: false,
        });
      }
      
      // Vencimientos personalizados
      if (cliente.vencimientos?.personalizados && cliente.vencimientos.personalizados.length > 0) {
        cliente.vencimientos.personalizados.forEach((v) => {
          vencimientos.push({
            cliente,
            tipo: `personalizado:${v.nombre}`,
            fecha: v.fecha,
            dias: getDaysUntil(v.fecha),
            esPersonalizado: true,
          });
        });
      }
    });
    
    return vencimientos;
  }, [clientesData]);

  // Aplicar filtros
  const vencimientos = useMemo(() => {
    let filtered = todosVencimientos;
    
    // Filtrar por rango de días
    if (rangoDias !== 'all') {
      const maxDays = rangoDias === '15' ? 15 : rangoDias === '30' ? 30 : 60;
      filtered = filtered.filter((v) => v.dias <= maxDays && v.dias >= 0);
    }
    
    // Filtrar por mes
    if (mes !== 'all') {
      const mesNumero = Number(mes);
      filtered = filtered.filter((v) => {
        const fechaVencimiento = new Date(v.fecha);
        return fechaVencimiento.getMonth() + 1 === mesNumero;
      });
    }
    
    // Filtrar por estado
    if (estado !== 'all') {
      filtered = filtered.filter((v) => v.cliente.estado === estado);
    }
    
    // Ordenar por fecha ascendente
    return filtered.sort((a, b) => {
      const fechaA = new Date(a.fecha).getTime();
      const fechaB = new Date(b.fecha).getTime();
      return fechaA - fechaB;
    });
  }, [todosVencimientos, rangoDias, mes, estado]);

  const isLoading = !clientesData;

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <CalendarDays className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
              Vencimientos
            </h1>
            <p className="text-slate-500 mt-1">
              Gestiona todos los vencimientos de tu cartera
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Filter className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Filtros</h2>
            <p className="text-sm text-slate-500">Refina los resultados</p>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Rango de días</Label>
            <Select value={rangoDias} onValueChange={setRangoDias}>
              <SelectTrigger className="h-11 bg-white/50 border-slate-200 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="15">Menos de 15 días</SelectItem>
                <SelectItem value="30">15-30 días</SelectItem>
                <SelectItem value="60">30-60 días</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Mes</Label>
            <Select value={mes} onValueChange={setMes}>
              <SelectTrigger className="h-11 bg-white/50 border-slate-200 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Todos los meses</SelectItem>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <SelectItem key={m} value={String(m)}>
                    {new Date(2000, m - 1, 1).toLocaleDateString('es-ES', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Estado</Label>
            <Select value={estado} onValueChange={(v) => setEstado(v as EstadoCliente | 'all')}>
              <SelectTrigger className="h-11 bg-white/50 border-slate-200 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Todos</SelectItem>
                {Object.entries(estadoLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Lista de Vencimientos */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Vencimientos
              </h2>
              <p className="text-sm text-slate-500">
                {vencimientos.length} {vencimientos.length === 1 ? 'resultado' : 'resultados'}
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500">Cargando vencimientos...</p>
          </div>
        ) : vencimientos.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              No se encontraron vencimientos
            </h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              Prueba ajustando los filtros para ver más resultados
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {vencimientos.map((vencimiento, index) => {
              const { cliente, tipo, fecha, dias, esPersonalizado } = vencimiento;
              const porcentaje = Math.max(0, Math.min(100, (dias / 60) * 100));
              const isVencido = dias < 0;
              const isUrgente = dias >= 0 && dias <= 15;
              const tipoLabels: Record<string, string> = {
                rc: 'RC',
                mercancias: 'Mercancías',
                acc: 'ACC',
                flotas: 'Flotas',
                pyme: 'PYME',
              };

              const getTipoLabel = () => {
                if (esPersonalizado) {
                  return tipo.replace('personalizado:', '');
                }
                return tipoLabels[tipo] || tipo;
              };

              return (
                <div
                  key={`${cliente.id}-${tipo}-${index}`}
                  className={cn(
                    'p-5 rounded-2xl border transition-all duration-300 group hover:shadow-lg',
                    isVencido
                      ? 'bg-gradient-to-r from-rose-50 to-rose-50/50 border-rose-200'
                      : isUrgente
                      ? 'bg-gradient-to-r from-amber-50 to-amber-50/50 border-amber-200'
                      : 'bg-white/70 border-slate-200 hover:border-slate-300'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h3 className="text-lg font-bold text-slate-800">{cliente.empresa}</h3>
                        <ChipMes fecha={fecha} config={config} />
                        <EstadoBadge estado={cliente.estado} />
                        <span className={cn(
                          "text-xs font-semibold px-3 py-1 rounded-full border",
                          esPersonalizado
                            ? "bg-gradient-to-r from-violet-100 to-violet-50 text-violet-700 border-violet-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        )}>
                          {getTipoLabel()}
                          {esPersonalizado && <span className="ml-1.5">✦</span>}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mb-3">
                        <span className="font-medium text-slate-700">{cliente.contacto}</span>
                        <span className="mx-2">•</span>
                        {formatDate(fecha)}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 mb-4">
                        {cliente.telefono && (
                          <a
                            href={`tel:${cliente.telefono}`}
                            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                          >
                            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                              <Phone className="h-3.5 w-3.5" />
                            </div>
                            {cliente.telefono}
                          </a>
                        )}
                        {cliente.correo && (
                          <a
                            href={`mailto:${cliente.correo}`}
                            className="flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-700 font-medium transition-colors"
                          >
                            <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                              <Mail className="h-3.5 w-3.5" />
                            </div>
                            {cliente.correo}
                          </a>
                        )}
                        <Link
                          to={`/clientes?search=${encodeURIComponent(cliente.empresa)}`}
                          className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                        >
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </div>
                          Ver cliente
                        </Link>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">
                            Días restantes: <span className={cn(
                              'font-bold',
                              isVencido ? 'text-rose-600' : isUrgente ? 'text-amber-600' : 'text-emerald-600'
                            )}>{dias}</span>
                          </span>
                          <span className={cn(
                            'text-xs font-bold px-2.5 py-1 rounded-full',
                            isVencido
                              ? 'bg-rose-100 text-rose-700'
                              : isUrgente
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          )}>
                            {isVencido ? 'Vencido' : dias > 30 ? 'Baja urgencia' : dias >= 15 ? 'Media urgencia' : 'Alta urgencia'}
                          </span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-500',
                              isVencido
                                ? 'bg-rose-500'
                                : isUrgente
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            )}
                            style={{ width: `${Math.max(5, 100 - porcentaje)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

