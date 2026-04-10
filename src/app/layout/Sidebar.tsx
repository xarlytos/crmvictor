import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Calendar,
  CalendarDays,
  FileWarning,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/clientes', label: 'Clientes', icon: Users },
  { path: '/vencimientos', label: 'Vencimientos', icon: Calendar },
  { path: '/calendario', label: 'Calendario', icon: CalendarDays },
  { path: '/siniestros', label: 'Siniestros', icon: FileWarning },
  { path: '/ajustes/colores-mes', label: 'Ajustes', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <div
      className={cn(
        'bg-[#f6f5f4] border-r border-black/10 h-screen fixed left-0 top-0 flex flex-col transition-all duration-300 ease-in-out z-50',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-black/10 flex items-center h-16">
        {!collapsed && (
          <div className="flex items-center gap-3 w-full">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0075de] to-[#005bab] flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-bold text-black/95 tracking-tight leading-tight">CRM Seguros</h1>
              <span className="text-[10px] text-[#615d59] font-medium">Gestión integral</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-9 h-9 mx-auto rounded-xl bg-gradient-to-br from-[#0075de] to-[#005bab] flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-[15px] font-medium',
                collapsed ? 'justify-center' : '',
                isActive
                  ? 'bg-white text-[#0075de] shadow-sm border border-black/5'
                  : 'text-[#615d59] hover:bg-white/60 hover:text-black/95'
              )}
            >
              <Icon className={cn(
                "h-5 w-5 flex-shrink-0 transition-colors",
                isActive ? "text-[#0075de]" : "text-[#a39e98]"
              )} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Toggle Button */}
      <div className="p-3 border-t border-black/10">
        <button
          onClick={onToggle}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-[#615d59] hover:bg-white/60 hover:text-black/95 transition-all duration-200 w-full text-sm font-medium',
            collapsed ? 'justify-center' : ''
          )}
          title={collapsed ? 'Expandir menú' : 'Minimizar menú'}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Minimizar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
