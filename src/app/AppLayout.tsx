import { Outlet } from 'react-router-dom';
import { Sidebar } from './layout/Sidebar';
import { ToastProvider } from '@/hooks/use-toast';

export function AppLayout() {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="ml-64">
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}

