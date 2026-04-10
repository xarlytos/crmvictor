import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ConfigUsuario } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { dataProvider } from '@/config/dataProvider';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Palette, Bell, Shield, RotateCcw, Trash2 } from 'lucide-react';

const meses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const defaultColors: Record<number, string> = {
  1: '#ef4444',
  2: '#f97316',
  3: '#fbbf24',
  4: '#84cc16',
  5: '#22c55e',
  6: '#10b981',
  7: '#14b8a6',
  8: '#06b6d4',
  9: '#3b82f6',
  10: '#6366f1',
  11: '#8b5cf6',
  12: '#a855f7',
};

export function ColoresPorMesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const { data: config, isLoading } = useQuery({
    queryKey: ['config'],
    queryFn: () => dataProvider.getConfig(),
  });

  const updateMutation = useMutation({
    mutationFn: (patch: Partial<ConfigUsuario>) => dataProvider.updateConfig(patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config'] });
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['vencimientos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'Configuración actualizada',
        description: 'Los cambios se han guardado correctamente.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al actualizar la configuración',
        variant: 'destructive',
      });
    },
  });

  const handleColorChange = (mes: number, color: string) => {
    if (!config) return;
    updateMutation.mutate({
      monthColors: {
        ...config.monthColors,
        [mes]: color,
      },
    });
  };

  const handleAlertWindowChange = (days: number) => {
    if (!config) return;
    updateMutation.mutate({
      alertWindowDays: days,
    });
  };

  const handleReset = () => {
    if (!config) return;
    updateMutation.mutate({
      monthColors: defaultColors,
      alertWindowDays: 60,
    });
  };

  const handleResetData = () => {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
      const mockProvider = dataProvider as any;
      if (mockProvider.resetData) {
        mockProvider.resetData();
        queryClient.invalidateQueries({ queryKey: ['clientes'] });
        queryClient.invalidateQueries({ queryKey: ['vencimientos'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        toast({
          title: 'Datos reiniciados',
          description: 'Los datos se han reiniciado correctamente.',
        });
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast({
      title: 'Sesión cerrada',
      description: 'Has cerrado sesión correctamente.',
    });
  };

  if (isLoading || !config) {
    return (
      <div className="p-12 text-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-lg shadow-slate-500/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
              Ajustes
            </h1>
            <p className="text-slate-500 mt-1">
              Personaliza tu experiencia en el CRM
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {import.meta.env.VITE_USE_MOCK === 'true' && (
            <Button
              variant="destructive"
              onClick={handleResetData}
              className="gap-2 rounded-xl"
            >
              <Trash2 className="h-4 w-4" />
              Reiniciar datos
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleReset}
            className="gap-2 rounded-xl border-slate-200 hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar por defecto
          </Button>
        </div>
      </div>

      {/* Colores por Mes */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Colores por Mes</h2>
            <p className="text-sm text-slate-500">
              Personaliza los colores de los chips de mes en el calendario
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {meses.map((mes, index) => {
            const mesNum = index + 1;
            const color = config.monthColors[mesNum] || defaultColors[mesNum];

            return (
              <div key={mesNum} className="space-y-2">
                <Label htmlFor={`mes-${mesNum}`} className="text-sm font-semibold text-slate-700">
                  {mes}
                </Label>
                <div className="flex items-center gap-2">
                  <div
                    className="w-12 h-10 rounded-xl border-2 border-slate-200 cursor-pointer overflow-hidden relative group"
                    style={{ backgroundColor: color }}
                  >
                    <input
                      id={`mes-${mesNum}`}
                      type="color"
                      value={color}
                      onChange={(e) => handleColorChange(mesNum, e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </div>
                  <Input
                    type="text"
                    value={color}
                    onChange={(e) => handleColorChange(mesNum, e.target.value)}
                    className="flex-1 h-10 rounded-xl bg-white/50 border-slate-200 font-mono text-sm"
                    placeholder="#000000"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ventana de Alerta */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Ventana de Alerta</h2>
            <p className="text-sm text-slate-500">
              Configura cuándo mostrar vencimientos como urgentes
            </p>
          </div>
        </div>
        <div className="max-w-md space-y-4">
          <div className="space-y-2">
            <Label htmlFor="alertWindowDays" className="text-sm font-semibold text-slate-700">
              Días para alerta de vencimientos
            </Label>
            <div className="flex items-center gap-4">
              <Input
                id="alertWindowDays"
                type="number"
                min="1"
                max="365"
                value={config.alertWindowDays}
                onChange={(e) => handleAlertWindowChange(Number(e.target.value))}
                className="h-11 rounded-xl bg-white/50 border-slate-200 w-32 text-center font-bold text-lg"
              />
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (config.alertWindowDays / 365) * 100)}%` }}
                />
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-xl">
            Los vencimientos que ocurran dentro de los próximos <span className="font-bold text-slate-700">{config.alertWindowDays} días</span> se mostrarán en la sección "Próximos Vencimientos" del dashboard
          </p>
        </div>
      </div>

      {/* Sesión */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
            <LogOut className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Sesión</h2>
            <p className="text-sm text-slate-500">
              Gestiona tu sesión de usuario
            </p>
          </div>
        </div>
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 border-0"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}

