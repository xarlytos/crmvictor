import { useQuery } from '@tanstack/react-query';
import { dataProvider } from '@/config/dataProvider';
import { KPI } from '@/components/shared/KPI';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  AlertCircle,
  ArrowRight,
  Building2,
  Zap,
  Target,
  Clock,
  LayoutDashboard,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate, getDaysUntil } from '@/lib/date';
import { ChipMes } from '@/components/shared/ChipMes';
import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
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

  const getNearestExpirationDays = (c: Cliente) => {
    const dates: string[] = [
      c.poliza?.fechaFin,
      c.vencimientos?.rc,
      c.vencimientos?.mercancias,
      c.vencimientos?.acc,
      c.vencimientos?.flotas,
      c.vencimientos?.pyme,
    ].filter(Boolean) as string[];

    if (c.vencimientos?.personalizados) {
      c.vencimientos.personalizados.forEach((v) => {
        if (v.fecha) dates.push(v.fecha);
      });
    }

    if (dates.length === 0) return 9999;

    const days = dates.map((d) => getDaysUntil(d));
    const futureDays = days.filter((d) => d >= 0);
    if (futureDays.length > 0) return Math.min(...futureDays);
    return Math.max(...days);
  };

  const vencimientosPorMes = useMemo(() => {
    const now = new Date();
    const meses = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    const mesActual = now.getMonth() + 1;
    const añoActual = now.getFullYear();

    const todosVencimientos: Array<{
      fecha: string;
      mes: number;
      año: number;
      client: Cliente;
      tipo: string;
    }> = [];

    clientes.forEach((c) => {
      const addExp = (dateStr: string | undefined, tipo: string) => {
        if (!dateStr) return;
        const fecha = new Date(dateStr);
        todosVencimientos.push({
          fecha: dateStr,
          mes: fecha.getMonth() + 1,
          año: fecha.getFullYear(),
          client: c,
          tipo,
        });
      };

      addExp(c.poliza?.fechaFin, 'Póliza');
      addExp(c.vencimientos?.rc, 'Responsabilidad Civil');
      addExp(c.vencimientos?.mercancias, 'Mercancías');
      addExp(c.vencimientos?.acc, 'Accidentes');
      addExp(c.vencimientos?.flotas, 'Flotas');
      addExp(c.vencimientos?.pyme, 'Pyme');

      if (c.vencimientos?.personalizados && c.vencimientos.personalizados.length > 0) {
        c.vencimientos.personalizados.forEach((v) => {
          addExp(v.fecha, v.nombre);
        });
      }
    });

    const datosMeses: Array<{
      mes: string;
      numero: number;
      vencimientos: number;
      esActual: boolean;
      detalles: Array<{ client: Cliente; tipo: string; fecha: string }>;
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
        detalles: expirationsInMonth.map((x) => ({
          client: x.client,
          tipo: x.tipo,
          fecha: x.fecha,
        })),
      });
    }

    return datosMeses;
  }, [clientes]);

  const now = new Date();
  const mesActual = now.getMonth() + 1;
  const vencenEsteMes = clientes.filter(
    (c) => c.poliza?.fechaFin && new Date(c.poliza.fechaFin).getMonth() + 1 === mesActual
  ).length;

  const vencenEnVentana = clientes.filter((c) => {
    const days = getNearestExpirationDays(c);
    return days >= 0 && days <= config.alertWindowDays;
  }).length;

  const vendidos = clientes.filter((c) => c.estado === 'vendido').length;
  const tasaCierre = clientes.length > 0 ? ((vendidos / clientes.length) * 100).toFixed(1) : '0';

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
        c.vencimientos.personalizados.forEach((v) => {
          addVencimiento(v.fecha, v.nombre);
        });
      }
    });

    return vencimientos.sort((a, b) => a.dias - b.dias).slice(0, 10);
  }, [clientes]);

  const mesesNombres = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
              Dashboard
            </h1>
            <p className="text-slate-500 mt-1">
              Visión general de tu cartera de clientes
            </p>
          </div>
        </div>
        <Link to="/clientes">
          <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300">
            Ver clientes
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <KPI
          title="Total Clientes"
          value={clientes.length}
          subtitle="Clientes registrados"
          icon={<Building2 className="h-6 w-6" />}
          color="blue"
          trend="up"
          trendValue="+12% este mes"
        />
        <KPI
          title="Vencen este Mes"
          value={vencenEsteMes}
          subtitle={mesesNombres[mesActual - 1]}
          icon={<Calendar className="h-6 w-6" />}
          color="amber"
        />
        <KPI
          title={`Próximos ${config.alertWindowDays} días`}
          value={vencenEnVentana}
          subtitle="Vencimientos urgentes"
          icon={<Clock className="h-6 w-6" />}
          color="rose"
        />
        <KPI
          title="Tasa de Cierre"
          value={`${tasaCierre}%`}
          subtitle={`${vendidos} vendidos de ${clientes.length}`}
          icon={<Target className="h-6 w-6" />}
          color="emerald"
          trend="up"
          trendValue="+5.2% vs mes pasado"
        />
      </div>

      {/* Gráfico y Vencimientos Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Gráfico */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Vencimientos por Mes
                </h2>
                <p className="text-sm text-slate-500">
                  Distribución anual de vencimientos
                </p>
              </div>
            </div>
            <Link to="/vencimientos">
              <Button
                variant="outline"
                className="rounded-xl border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              >
                Ver detalles
              </Button>
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={vencimientosPorMes}
              onClick={(data: any) => {
                if (data && data.activePayload && data.activePayload.length > 0) {
                  setSelectedMonth(data.activePayload[0].payload);
                }
              }}
              className="cursor-pointer"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(148, 163, 184, 0.2)"
              />
              <XAxis
                dataKey="mes"
                tick={{ fontSize: 11, fill: '#64748b' }}
                angle={-45}
                textAnchor="end"
                height={80}
                stroke="#e2e8f0"
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#64748b' }}
                allowDecimals={false}
                domain={[0, 'dataMax']}
                stroke="#e2e8f0"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xl">
                        <p className="font-bold text-slate-800">{data.mes}</p>
                        <p className="text-sm text-slate-500 mt-1">
                          Vencimientos:{' '}
                          <span className="font-bold text-blue-600">
                            {Math.round(data.vencimientos)}
                          </span>
                        </p>
                        {data.esActual && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 mt-2">
                            Mes actual
                          </span>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="vencimientos" radius={[8, 8, 0, 0]}>
                {vencimientosPorMes.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.esActual
                        ? '#3b82f6'
                        : entry.vencimientos > 0
                        ? config.monthColors[entry.numero] || '#94a3b8'
                        : '#e2e8f0'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Próximos Vencimientos */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Próximos Vencimientos
              </h2>
              <p className="text-sm text-slate-500">Los más urgentes</p>
            </div>
          </div>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {proximosVencimientos.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay vencimientos próximos</p>
              </div>
            ) : (
              proximosVencimientos.slice(0, 5).map((item, index) => {
                const dias = item.dias;
                const isVencido = dias < 0;
                const isUrgente = dias >= 0 && dias <= 15;

                return (
                  <div
                    key={`${item.cliente.id}-${item.tipo}-${index}`}
                    className={cn(
                      'p-4 rounded-xl border transition-all duration-300 hover:shadow-md',
                      isVencido
                        ? 'bg-rose-50 border-rose-200'
                        : isUrgente
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-white border-slate-100'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-800 truncate max-w-[120px]">
                        {item.cliente.empresa}
                      </span>
                      <span
                        className={cn(
                          'text-xs font-bold px-2 py-0.5 rounded-full',
                          isVencido
                            ? 'bg-rose-200 text-rose-800'
                            : isUrgente
                            ? 'bg-amber-200 text-amber-800'
                            : 'bg-emerald-100 text-emerald-700'
                        )}
                      >
                        {isVencido ? 'Vencido' : `${dias} días`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <ChipMes fecha={item.fecha} config={config} />
                      <span>•</span>
                      <span>{item.tipo}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <Link to="/vencimientos">
            <Button
              variant="ghost"
              className="w-full mt-4 text-slate-500 hover:text-slate-700"
            >
              Ver todos los vencimientos
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Dialog */}
      <Dialog
        open={!!selectedMonth}
        onOpenChange={(open) => !open && setSelectedMonth(null)}
      >
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">
              Vencimientos {selectedMonth?.mes}
            </DialogTitle>
          </DialogHeader>
          <div className="h-[300px] mt-4 overflow-y-auto">
            <div className="space-y-3">
              {selectedMonth?.vencimientos.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">
                  No hay vencimientos este mes
                </p>
              ) : (
                selectedMonth?.vencimientos.map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col p-4 rounded-xl border border-slate-100 bg-white shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-800">
                        {item.client.empresa}
                      </span>
                      <Badge
                        variant="outline"
                        className="border-slate-200 text-slate-600"
                      >
                        {item.tipo}
                      </Badge>
                    </div>
                    <div className="flex justify-between mt-2 text-sm text-slate-500">
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
