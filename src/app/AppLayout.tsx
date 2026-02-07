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
      <div className="min-h-screen bg-background">
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggle={toggleSidebar} 
        />
        <div 
          className={cn(
            'transition-all duration-300 ease-in-out',
            sidebarCollapsed ? 'ml-16' : 'ml-64'
          )}
        >
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
