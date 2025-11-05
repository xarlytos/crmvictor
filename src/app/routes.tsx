import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { ClientesList } from '@/features/clientes/pages/ClientesList';
import { VencimientosPage } from '@/features/vencimientos/pages/VencimientosPage';
import { ColoresPorMesPage } from '@/features/ajustes/pages/ColoresPorMes';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'clientes',
        element: <ClientesList />,
      },
      {
        path: 'vencimientos',
        element: <VencimientosPage />,
      },
      {
        path: 'ajustes/colores-mes',
        element: <ColoresPorMesPage />,
      },
    ],
  },
]);

