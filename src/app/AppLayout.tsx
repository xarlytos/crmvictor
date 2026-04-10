import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './layout/Sidebar';
import { ToastProvider } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/20">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
        />
        <div
          className={cn(
            'transition-all duration-500 ease-out min-h-screen',
            sidebarCollapsed ? 'ml-20' : 'ml-72'
          )}
        >
          <main className="p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
