import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { dataProvider } from '@/config/dataProvider';
import { formatDate, getDaysUntil, getUrgenciaColor } from '@/lib/date';
import { ChipMes } from '@/components/shared/ChipMes';
import { Progress } from '@/components/ui/progress';
import { EstadoBadge } from '@/components/shared/EstadoBadge';
import { Phone, Mail, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { EstadoCliente, Cliente } from '@/types';

const estadoLabels: Record<EstadoCliente, string> = {
  contratado: 'Contratado',
  contactado_buena_pinta: 'Contactado - Buena Pinta',
  en_negociacion: 'En Negociación',
  descartado: 'Descartado',
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

  // Extraer TODOS los vencimientos de todos los clientes
  const todosVencimientos = useMemo(() => {
    if (!clientesData?.items) return [];
    
    const vencimientos: Array<{
      cliente: Cliente;
      tipo: 'rc' | 'mercancias' | 'acc' | 'flotas' | 'pyme';
      fecha: string;
      dias: number;
    }> = [];
    
    clientesData.items.forEach((cliente) => {
      if (cliente.vencimientos?.rc) {
        vencimientos.push({
          cliente,
          tipo: 'rc',
          fecha: cliente.vencimientos.rc,
          dias: getDaysUntil(cliente.vencimientos.rc),
        });
      }
      if (cliente.vencimientos?.mercancias) {
        vencimientos.push({
          cliente,
          tipo: 'mercancias',
          fecha: cliente.vencimientos.mercancias,
          dias: getDaysUntil(cliente.vencimientos.mercancias),
        });
      }
      if (cliente.vencimientos?.acc) {
        vencimientos.push({
          cliente,
          tipo: 'acc',
          fecha: cliente.vencimientos.acc,
          dias: getDaysUntil(cliente.vencimientos.acc),
        });
      }
      if (cliente.vencimientos?.flotas) {
        vencimientos.push({
          cliente,
          tipo: 'flotas',
          fecha: cliente.vencimientos.flotas,
          dias: getDaysUntil(cliente.vencimientos.flotas),
        });
      }
      if (cliente.vencimientos?.pyme) {
        vencimientos.push({
          cliente,
          tipo: 'pyme',
          fecha: cliente.vencimientos.pyme,
          dias: getDaysUntil(cliente.vencimientos.pyme),
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Vencimientos</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label>Rango de días</Label>
              <Select value={rangoDias} onValueChange={setRangoDias}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="15">Menos de 15 días</SelectItem>
                  <SelectItem value="30">15-30 días</SelectItem>
                  <SelectItem value="60">30-60 días</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Mes</Label>
              <Select value={mes} onValueChange={setMes}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los meses</SelectItem>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {new Date(2000, m - 1, 1).toLocaleDateString('es-ES', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Estado</Label>
              <Select value={estado} onValueChange={(v) => setEstado(v as EstadoCliente | 'all')}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Vencimientos ({vencimientos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Cargando...</div>
          ) : vencimientos.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No se encontraron vencimientos con los filtros seleccionados
            </div>
          ) : (
            <div className="space-y-4">
              {vencimientos.map((vencimiento, index) => {
                const { cliente, tipo, fecha, dias } = vencimiento;
                const porcentaje = Math.max(0, Math.min(100, (dias / 60) * 100));
                const colorClass = getUrgenciaColor(dias);
                const tipoLabels: Record<string, string> = {
                  rc: 'RC',
                  mercancias: 'Mercancías',
                  acc: 'ACC',
                  flotas: 'Flotas',
                  pyme: 'PYME',
                };

                return (
                  <div
                    key={`${cliente.id}-${tipo}-${index}`}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{cliente.empresa}</h3>
                          <ChipMes fecha={fecha} config={config} />
                          <EstadoBadge estado={cliente.estado} />
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            {tipoLabels[tipo]}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {cliente.contacto} • {formatDate(fecha)}
                        </p>
                        <div className="flex items-center gap-4 mb-3">
                          {cliente.telefono && (
                            <a
                              href={`tel:${cliente.telefono}`}
                              className="text-primary hover:underline flex items-center gap-1 text-sm"
                            >
                              <Phone className="h-4 w-4" />
                              {cliente.telefono}
                            </a>
                          )}
                          {cliente.correo && (
                            <a
                              href={`mailto:${cliente.correo}`}
                              className="text-primary hover:underline flex items-center gap-1 text-sm"
                            >
                              <Mail className="h-4 w-4" />
                              {cliente.correo}
                            </a>
                          )}
                          <Link
                            to={`/clientes?search=${encodeURIComponent(cliente.empresa)}`}
                            className="text-primary hover:underline flex items-center gap-1 text-sm"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Ver cliente
                          </Link>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              Días restantes: <strong>{dias}</strong>
                            </span>
                            <span className={`font-medium ${colorClass.replace('bg-', 'text-')}`}>
                              {dias > 30 ? 'Baja urgencia' : dias >= 15 ? 'Media urgencia' : 'Alta urgencia'}
                            </span>
                          </div>
                          <Progress value={100 - porcentaje} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

