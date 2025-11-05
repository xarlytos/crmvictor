import { useLocation } from 'react-router-dom';
import { Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Topbar() {
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname === '/dashboard' || location.pathname === '/') {
      return 'Dashboard';
    }
    if (location.pathname === '/clientes') {
      return 'Clientes';
    }
    if (location.pathname === '/vencimientos') {
      return 'Vencimientos';
    }
    if (location.pathname.includes('/ajustes')) {
      return 'Ajustes';
    }
    return 'CRM Seguros';
  };

  return (
    <div className="h-16 bg-card border-b border-border flex items-center justify-between px-6 fixed top-0 left-64 right-0 z-10">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">{getPageTitle()}</h2>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" title="Notificaciones">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" title="Perfil">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

