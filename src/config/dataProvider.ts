import { MockDataProvider } from '@/mocks/MockDataProvider';
import { HttpDataProvider } from '@/api/HttpDataProvider';
import type { DataProvider } from '@/types';

// Detectar si debemos usar el backend real o el mock
// Por defecto usamos el backend real (HttpDataProvider)
// Solo usamos mock si VITE_USE_MOCK está explícitamente en 'true'
const useMock = import.meta.env.VITE_USE_MOCK === 'true';

// Crear el dataProvider apropiado
let dataProvider: DataProvider;

if (useMock) {
  // Usar mock (datos en localStorage) - solo si se configura explícitamente
  console.log('📦 Usando MockDataProvider (datos locales)');
  dataProvider = new MockDataProvider();
} else {
  // Usar backend real (por defecto)
  console.log('🌐 Usando HttpDataProvider (API backend)');
  dataProvider = new HttpDataProvider();
}

export { dataProvider };

// Helper para cambiar entre providers en tiempo de ejecución (útil para testing)
export function createDataProvider(useMockProvider: boolean): DataProvider {
  if (useMockProvider) {
    return new MockDataProvider();
  }
  return new HttpDataProvider();
}
