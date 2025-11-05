import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ConfigUsuario } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { dataProvider } from '@/config/dataProvider';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut } from 'lucide-react';

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
    return <div className="p-8 text-center text-muted-foreground">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ajustes</h1>
          <p className="text-muted-foreground mt-1">
            Configura los colores por mes y la ventana de alerta de vencimientos
          </p>
        </div>
        <div className="flex gap-2">
          {import.meta.env.VITE_USE_MOCK === 'true' && (
            <Button variant="destructive" onClick={handleResetData}>
              Reiniciar datos
            </Button>
          )}
          <Button variant="outline" onClick={handleReset}>
            Restaurar por defecto
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Colores por Mes</CardTitle>
          <CardDescription>
            Personaliza los colores que se mostrarán en los chips de mes para cada mes del año
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {meses.map((mes, index) => {
              const mesNum = index + 1;
              const color = config.monthColors[mesNum] || defaultColors[mesNum];

              return (
                <div key={mesNum} className="space-y-2">
                  <Label htmlFor={`mes-${mesNum}`}>{mes}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id={`mes-${mesNum}`}
                      type="color"
                      value={color}
                      onChange={(e) => handleColorChange(mesNum, e.target.value)}
                      className="w-20 h-10 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={color}
                      onChange={(e) => handleColorChange(mesNum, e.target.value)}
                      className="flex-1"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ventana de Alerta</CardTitle>
          <CardDescription>
            Configura el rango de días para filtrar los vencimientos que se muestran en "Próximos Vencimientos" del dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-w-md">
            <Label htmlFor="alertWindowDays">Días para filtrar vencimientos</Label>
            <Input
              id="alertWindowDays"
              type="number"
              min="1"
              max="365"
              value={config.alertWindowDays}
              onChange={(e) => handleAlertWindowChange(Number(e.target.value))}
            />
            <p className="text-sm text-muted-foreground">
              Los vencimientos que ocurran dentro de los próximos {config.alertWindowDays} días se mostrarán en la sección "Próximos Vencimientos" del dashboard
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sesión</CardTitle>
          <CardDescription>
            Gestiona tu sesión de usuario
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

