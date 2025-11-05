import { MockDataProvider } from '@/mocks/MockDataProvider';
import type { DataProvider } from '@/types';

// SIEMPRE usar MockDataProvider (solo frontend con datos de prueba)
export const dataProvider: DataProvider = new MockDataProvider();

