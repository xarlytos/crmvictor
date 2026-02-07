import { useQuery } from '@tanstack/react-query';
import { dataProvider } from '@/config/dataProvider';
import { KPI } from '@/components/shared/KPI';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar, AlertCircle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate, getDaysUntil, getUrgenciaColor } from '@/lib/date';
import { ChipMes } from '@/components/shared/ChipMes';
import { Progress } from '@/components/ui/progress';
import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Cliente } from '@/types';

export function DashboardPage() {
  const { data: config = { alertWindowDays: 60, monthColors: {} } } = useQuery({
    queryKey: ['config'],
    queryFn: () => dataProvider.getConfig(),
  });

  const { data: clientesData } = useQuery({
    queryKey: ['clientes', 'all'],
    queryFn: () => dataProvider.listClientes(),
  });

  const clientes = clientesData?.items || [];

  const [selectedMonth, setSelectedMonth] = useState<{
    mes: string;
    vencimientos: Array<{ client: Cliente; tipo: string; fecha: string }>;
  } | null>(null);

  // Helper to get nearest expiration days
  const getNearestExpirationDays = (c: Cliente) => {
    const dates = [
      c.poliza?.fechaFin,
      c.vencimientos?.rc,
      c.vencimientos?.mercancias,
      c.vencimientos?.acc,
      c.vencimientos?.flotas,
      c.vencimientos?.pyme,
    ].filter(Boolean) as string[];

    if (dates.length === 0) return 9999;

    const days = dates.map(d => getDaysUntil(d));
    const futureDays = days.filter(d => d >= 0);
    if (futureDays.length > 0) return Math.min(...futureDays);
    return Math.max(...days); // All expired
  };

  // Calcular vencimientos por mes - TODOS los vencimientos de todos los clientes
  const vencimientosPorMes = useMemo(() => {
    const now = new Date();
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const mesActual = now.getMonth() + 1;
    const añoActual = now.getFullYear();

    // Recopilar TODOS los vencimientos de todos los clientes
    const todosVencimientos: Array<{ fecha: string; mes: number; año: number; client: Cliente; tipo: string }> = [];

    clientes.forEach((c) => {
      const addExp = (dateStr: string | undefined, tipo: string) => {
        if (!dateStr) return;
        const fecha = new Date(dateStr);
        todosVencimientos.push({
          fecha: dateStr,
          mes: fecha.getMonth() + 1,
          año: fecha.getFullYear(),
          client: c,
          tipo
        });
      };

      addExp(c.poliza?.fechaFin, 'Póliza');
      addExp(c.vencimientos?.rc, 'Responsabilidad Civil');
      addExp(c.vencimientos?.mercancias, 'Mercancías');
      addExp(c.vencimientos?.acc, 'Accidentes');
      addExp(c.vencimientos?.flotas, 'Flotas');
      addExp(c.vencimientos?.pyme, 'Pyme');
    });

    // Crear un mapa de meses con vencimientos (12 meses desde el mes actual)
    const datosMeses: Array<{
      mes: string;
      numero: number;
      vencimientos: number;
      esActual: boolean;
      detalles: Array<{ client: Cliente; tipo: string; fecha: string }>
    }> = [];

    for (let i = 0; i < 12; i++) {
      const mesNumero = ((mesActual - 1 + i) % 12) + 1;
      const año = añoActual + Math.floor((mesActual - 1 + i) / 12);
      const nombreMes = meses[mesNumero - 1];
      const mesConAño = `${nombreMes} ${año}`;
      const esMesActual = i === 0;

      const expirationsInMonth = todosVencimientos.filter((v) => {
        return v.mes === mesNumero && v.año === año;
      });

      datosMeses.push({
        mes: mesConAño,
        numero: mesNumero,
        vencimientos: expirationsInMonth.length,
        esActual: esMesActual,
        detalles: expirationsInMonth.map(x => ({ client: x.client, tipo: x.tipo, fecha: x.fecha })),
      });
    }

    return datosMeses;
  }, [clientes]);

  // Calcular métricas
  const now = new Date();
  const mesActual = now.getMonth() + 1;
  const vencenEsteMes = clientes.filter(
    (c) => c.poliza?.fechaFin && new Date(c.poliza.fechaFin).getMonth() + 1 === mesActual
  ).length;

  const vencenEnVentana = clientes.filter(c => {
    const days = getNearestExpirationDays(c);
    return days >= 0 && days <= config.alertWindowDays;
  }).length;

  const contratados = clientes.filter((c) => c.estado === 'contratado').length;
  const tasaCierre = clientes.length > 0 ? ((contratados / clientes.length) * 100).toFixed(1) : '0';

  // Obtener TODOS los vencimientos individuales ordenados por fecha
  const proximosVencimientos = useMemo(() => {
    const vencimientos: Array<{
      cliente: Cliente;
      tipo: string;
      fecha: string;
      dias: number;
    }> = [];

    clientes.forEach((c) => {
      const addVencimiento = (fecha: string | undefined, tipo: string) => {
        if (!fecha) return;
        const dias = getDaysUntil(fecha);
        vencimientos.push({ cliente: c, tipo, fecha, dias });
      };

      addVencimiento(c.poliza?.fechaFin, 'Póliza');
      addVencimiento(c.vencimientos?.rc, 'RC');
      addVencimiento(c.vencimientos?.mercancias, 'Mercancías');
      addVencimiento(c.vencimientos?.acc, 'ACC');
      addVencimiento(c.vencimientos?.flotas, 'Flotas');
      addVencimiento(c.vencimientos?.pyme, 'PYME');
    });

    // Ordenar por días (el que vence antes primero)
    return vencimientos
      .sort((a, b) => a.dias - b.dias)
      .slice(0, 10);
  }, [clientes]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPI
          title="Total Clientes"
          value={clientes.length}
          icon={<Users className="h-4 w-4" />}
        />
        <KPI
          title="Vencen este Mes"
          value={vencenEsteMes}
          icon={<Calendar className="h-4 w-4" />}
        />
        <KPI
          title={`Vencen en ${config.alertWindowDays} días`}
          value={vencenEnVentana}
          icon={<AlertCircle className="h-4 w-4" />}
        />
        <KPI
          title="Tasa de Cierre"
          value={`${tasaCierre}%`}
          subtitle={`${contratados} contratados`}
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      {/* Gráfico de Vencimientos por Mes */}
      <Card>
        <CardHeader>
          <CardTitle>Vencimientos por Mes</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={450}>
            <BarChart
              data={vencimientosPorMes}
              onClick={(data: any) => {
                if (data && data.activePayload && data.activePayload.length > 0) {
                  setSelectedMonth(data.activePayload[0].payload);
                }
              }}
              className="cursor-pointer"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="mes"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis
                label={{ value: 'Número de Vencimientos', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
                allowDecimals={false}
                domain={[0, 'dataMax']}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                        <p className="font-semibold">{data.mes}</p>
                        <p className="text-sm text-muted-foreground">
                          Vencimientos: <span className="font-medium text-foreground">{Math.round(data.vencimientos)}</span>
                        </p>
                        {data.esActual && (
                          <p className="text-xs text-primary mt-1">Mes actual</p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="vencimientos" radius={[4, 4, 0, 0]}>
                {vencimientosPorMes.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.esActual
                      ? config.monthColors[entry.numero] || 'hsl(var(--primary))'
                      : entry.vencimientos > 0
                        ? config.monthColors[entry.numero] || 'hsl(var(--muted-foreground))'
                        : 'hsl(var(--muted))'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Próximos Vencimientos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Próximos Vencimientos</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link to="/vencimientos">Ver todos</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {proximosVencimientos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay vencimientos próximos
              </p>
            ) : (
              proximosVencimientos.map((item, index) => {
                const dias = item.dias;
                const porcentaje = Math.max(0, Math.min(100, (dias / 60) * 100));
                const isVencido = dias < 0;

                return (
                  <div
                    key={`${item.cliente.id}-${item.tipo}-${index}`}
                    className={cn(
                      "flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors",
                      isVencido && "border-red-300 bg-red-50/50",
                      dias >= 0 && dias <= 15 && "border-amber-300 bg-amber-50/50"
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{item.cliente.empresa}</span>
                        <ChipMes fecha={item.fecha} config={config} />
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          isVencido && "bg-red-100 text-red-700",
                          dias >= 0 && dias <= 15 && "bg-amber-100 text-amber-700",
                          dias > 15 && "bg-green-100 text-green-700"
                        )}>
                          {item.tipo}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.cliente.contacto} • {formatDate(item.fecha)}
                      </p>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className={cn(
                            "font-medium",
                            isVencido && "text-red-600",
                            dias >= 0 && dias <= 15 && "text-amber-600"
                          )}>
                            {isVencido 
                              ? `Vencido hace ${Math.abs(dias)} días` 
                              : dias === 0 
                                ? 'Vence hoy'
                                : `Faltan ${dias} días`}
                          </span>
                          <span className={getUrgenciaColor(dias).replace('bg-', 'text-')}>
                            {dias > 30 ? 'Baja' : dias >= 15 ? 'Media' : 'Alta'} urgencia
                          </span>
                        </div>
                        <Progress value={100 - porcentaje} className="h-1" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedMonth} onOpenChange={(open) => !open && setSelectedMonth(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Vencimientos {selectedMonth?.mes}</DialogTitle>
          </DialogHeader>
          <div className="h-[300px] mt-4 overflow-y-auto">
            <div className="space-y-4">
              {selectedMonth?.vencimientos.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center">No hay vencimientos este mes</p>
              ) : (
                selectedMonth?.vencimientos.map((item, i) => (
                  <div key={i} className="flex flex-col p-3 border rounded-lg bg-card">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold">{item.client.empresa}</span>
                      <Badge variant="outline">{item.tipo}</Badge>
                    </div>
                    <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                      <span>{formatDate(item.fecha)}</span>
                      <span>{item.client.contacto}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
