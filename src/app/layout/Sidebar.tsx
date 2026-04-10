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
  Sparkles,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'blue' },
  { path: '/clientes', label: 'Clientes', icon: Users, color: 'violet' },
  { path: '/vencimientos', label: 'Vencimientos', icon: Calendar, color: 'amber' },
  { path: '/calendario', label: 'Calendario', icon: CalendarDays, color: 'emerald' },
  { path: '/siniestros', label: 'Siniestros', icon: FileWarning, color: 'rose' },
  { path: '/ajustes/colores-mes', label: 'Ajustes', icon: Settings, color: 'slate' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const colorGradients: Record<string, string> = {
  blue: 'from-blue-500 to-blue-600',
  violet: 'from-violet-500 to-violet-600',
  amber: 'from-amber-500 to-amber-600',
  emerald: 'from-emerald-500 to-emerald-600',
  rose: 'from-rose-500 to-rose-600',
  slate: 'from-slate-500 to-slate-600',
};

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <div
      className={cn(
        'h-screen fixed left-0 top-0 flex flex-col transition-all duration-500 ease-out z-50',
        'bg-white/70 backdrop-blur-xl border-r border-white/50',
        'shadow-[4px_0_24px_rgba(0,0,0,0.04)]',
        collapsed ? 'w-20' : 'w-72'
      )}
    >
      {/* Header */}
      <div className="p-5 border-b border-slate-100">
        {!collapsed ? (
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                CRM Seguros
              </h1>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Gestión Premium
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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
                'flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden',
                collapsed ? 'justify-center' : '',
                isActive
                  ? 'bg-gradient-to-r from-blue-50 to-violet-50 text-blue-700 shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className={cn(
                  'absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b',
                  colorGradients[item.color]
                )} />
              )}

              {/* Icon container */}
              <div className={cn(
                'relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300',
                isActive
                  ? cn('bg-gradient-to-br text-white shadow-md', colorGradients[item.color])
                  : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:shadow-sm'
              )}>
                <Icon className="w-5 h-5" />
              </div>

              {!collapsed && (
                <span className="font-semibold text-sm">
                  {item.label}
                </span>
              )}

              {/* Hover glow effect */}
              <div className={cn(
                'absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10',
                colorGradients[item.color],
                'from-transparent via-transparent to-transparent'
              )} />
            </Link>
          );
        })}
      </nav>

      {/* Toggle Button */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={onToggle}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all duration-300 w-full',
            collapsed ? 'justify-center' : ''
          )}
          title={collapsed ? 'Expandir menú' : 'Minimizar menú'}
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </div>
          {!collapsed && <span className="font-semibold text-sm">Minimizar</span>}
        </button>
      </div>

      {/* Bottom gradient decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-500/5 to-transparent pointer-events-none" />
    </div>
  );
}
