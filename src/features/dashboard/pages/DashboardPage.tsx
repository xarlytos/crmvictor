import { useQuery } from '@tanstack/react-query';
import { dataProvider } from '@/config/dataProvider';
import { KPI } from '@/components/shared/KPI';
import { Button } from '@/components/ui/button';
import { Users, Calendar, AlertCircle, TrendingUp, ArrowRight, Building2 } from 'lucide-react';
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
    const dates: string[] = [
      c.poliza?.fechaFin,
      c.vencimientos?.rc,
      c.vencimientos?.mercancias,
      c.vencimientos?.acc,
      c.vencimientos?.flotas,
      c.vencimientos?.pyme,
    ].filter(Boolean) as string[];

    // Añadir vencimientos personalizados
    if (c.vencimientos?.personalizados) {
      c.vencimientos.personalizados.forEach(v => {
        if (v.fecha) dates.push(v.fecha);
      });
    }

    if (dates.length === 0) return 9999;

    const days = dates.map(d => getDaysUntil(d));
    const futureDays = days.filter(d => d >= 0);
    if (futureDays.length > 0) return Math.min(...futureDays);
    return Math.max(...days);
  };

  // Calcular vencimientos por mes
  const vencimientosPorMes = useMemo(() => {
    const now = new Date();
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const mesActual = now.getMonth() + 1;
    const añoActual = now.getFullYear();

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

      if (c.vencimientos?.personalizados && c.vencimientos.personalizados.length > 0) {
        c.vencimientos.personalizados.forEach(v => {
          addExp(v.fecha, v.nombre);
        });
      }
    });

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

  const vendidos = clientes.filter((c) => c.estado === 'vendido').length;
  const tasaCierre = clientes.length > 0 ? ((vendidos / clientes.length) * 100).toFixed(1) : '0';

  // Próximos vencimientos
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

      if (c.vencimientos?.personalizados) {
        c.vencimientos.personalizados.forEach(v => {
          addVencimiento(v.fecha, v.nombre);
        });
      }
    });

    return vencimientos
      .sort((a, b) => a.dias - b.dias)
      .slice(0, 10);
  }, [clientes]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black/95">Dashboard</h1>
          <p className="text-[#615d59] mt-1">Visión general de tu cartera de clientes</p>
        </div>
        <Link to="/clientes">
          <Button className="bg-[#0075de] hover:bg-[#005bab] text-white font-semibold">
            Ver clientes
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPI
          title="Total Clientes"
          value={clientes.length}
          subtitle="Clientes registrados"
          icon={<Building2 className="h-5 w-5" />}
          color="slate"
        />
        <KPI
          title="Vencen este Mes"
          value={vencenEsteMes}
          subtitle={`${mesActual === 1 ? 'Enero' : mesActual === 2 ? 'Febrero' : mesActual === 3 ? 'Marzo' : mesActual === 4 ? 'Abril' : mesActual === 5 ? 'Mayo' : mesActual === 6 ? 'Junio' : mesActual === 7 ? 'Julio' : mesActual === 8 ? 'Agosto' : mesActual === 9 ? 'Septiembre' : mesActual === 10 ? 'Octubre' : mesActual === 11 ? 'Noviembre' : 'Diciembre'}`}
          icon={<Calendar className="h-5 w-5" />}
          color="blue"
        />
        <KPI
          title={`Próximos ${config.alertWindowDays} días`}
          value={vencenEnVentana}
          subtitle="Vencimientos urgentes"
          icon={<AlertCircle className="h-5 w-5" />}
          color="amber"
        />
        <KPI
          title="Tasa de Cierre"
          value={`${tasaCierre}%`}
          subtitle={`${vendidos} vendidos de ${clientes.length}`}
          icon={<TrendingUp className="h-5 w-5" />}
          color="green"
        />
      </div>

      {/* Gráfico de Vencimientos por Mes */}
      <div className="notion-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-black/95">Vencimientos por Mes</h2>
            <p className="text-sm text-[#615d59]">Distribución anual de vencimientos</p>
          </div>
          <Link to="/vencimientos">
            <Button variant="outline" className="border-black/10 hover:bg-[#f6f5f4]">
              Ver detalles
            </Button>
          </Link>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={vencimientosPorMes}
            onClick={(data: any) => {
              if (data && data.activePayload && data.activePayload.length > 0) {
                setSelectedMonth(data.activePayload[0].payload);
              }
            }}
            className="cursor-pointer"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
            <XAxis
              dataKey="mes"
              tick={{ fontSize: 11, fill: '#615d59' }}
              angle={-45}
              textAnchor="end"
              height={80}
              stroke="rgba(0,0,0,0.1)"
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#615d59' }}
              allowDecimals={false}
              domain={[0, 'dataMax']}
              stroke="rgba(0,0,0,0.1)"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white border border-black/10 rounded-lg p-3 shadow-lg">
                      <p className="font-semibold text-black/95">{data.mes}</p>
                      <p className="text-sm text-[#615d59]">
                        Vencimientos: <span className="font-medium text-[#0075de]">{Math.round(data.vencimientos)}</span>
                      </p>
                      {data.esActual && (
                        <span className="badge-pill mt-2">Mes actual</span>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="vencimientos" radius={[6, 6, 0, 0]}>
              {vencimientosPorMes.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.esActual
                    ? '#0075de'
                    : entry.vencimientos > 0
                      ? config.monthColors[entry.numero] || '#a39e98'
                      : '#e5e5e5'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Próximos Vencimientos */}
      <div className="notion-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-black/95">Próximos Vencimientos</h2>
            <p className="text-sm text-[#615d59]">Los 10 vencimientos más próximos</p>
          </div>
          <Link to="/vencimientos">
            <Button variant="outline" className="border-black/10 hover:bg-[#f6f5f4]">
              Ver todos
            </Button>
          </Link>
        </div>
        <div className="space-y-3">
          {proximosVencimientos.length === 0 ? (
            <div className="text-center py-8 text-[#a39e98]">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No hay vencimientos próximos</p>
            </div>
          ) : (
            proximosVencimientos.map((item, index) => {
              const dias = item.dias;
              const porcentaje = Math.max(0, Math.min(100, (dias / 60) * 100));
              const isVencido = dias < 0;

              return (
                <div
                  key={`${item.cliente.id}-${item.tipo}-${index}`}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border transition-all duration-200 hover:shadow-sm",
                    isVencido
                      ? "bg-red-50/50 border-red-200"
                      : dias >= 0 && dias <= 15
                        ? "bg-amber-50/50 border-amber-200"
                        : "bg-white border-black/10"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-black/95 truncate">{item.cliente.empresa}</span>
                      <ChipMes fecha={item.fecha} config={config} />
                      <span className={cn(
                        "text-xs px-2.5 py-0.5 rounded-full font-semibold",
                        isVencido && "bg-red-100 text-red-700",
                        dias >= 0 && dias <= 15 && "bg-amber-100 text-amber-700",
                        dias > 15 && "bg-emerald-100 text-emerald-700"
                      )}>
                        {item.tipo}
                      </span>
                    </div>
                    <p className="text-sm text-[#615d59]">
                      {item.cliente.contacto} • {formatDate(item.fecha)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <div className="text-right">
                      <p className={cn(
                        "text-sm font-semibold",
                        isVencido && "text-red-600",
                        dias >= 0 && dias <= 15 && "text-amber-600",
                        dias > 15 && "text-emerald-600"
                      )}>
                        {isVencido
                          ? `Vencido`
                          : dias === 0
                            ? 'Hoy'
                            : `${dias} días`}
                      </p>
                      <p className="text-xs text-[#a39e98]">
                        {isVencido ? `${Math.abs(dias)} días atrás` : 'restantes'}
                      </p>
                    </div>
                    <div className="w-24">
                      <Progress value={100 - porcentaje} className="h-1.5" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Dialog open={!!selectedMonth} onOpenChange={(open) => !open && setSelectedMonth(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Vencimientos {selectedMonth?.mes}</DialogTitle>
          </DialogHeader>
          <div className="h-[300px] mt-4 overflow-y-auto">
            <div className="space-y-3">
              {selectedMonth?.vencimientos.length === 0 ? (
                <p className="text-sm text-[#a39e98] text-center py-4">No hay vencimientos este mes</p>
              ) : (
                selectedMonth?.vencimientos.map((item, i) => (
                  <div key={i} className="flex flex-col p-4 rounded-xl border border-black/10 bg-white">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-black/95">{item.client.empresa}</span>
                      <Badge variant="outline" className="border-black/10">{item.tipo}</Badge>
                    </div>
                    <div className="flex justify-between mt-2 text-sm text-[#615d59]">
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
