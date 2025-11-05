import { create } from 'zustand';
import type { FiltrosClientes, EstadoCliente, TipoCarga, Transporte } from '@/types';

interface ClientesStore {
  filtros: FiltrosClientes;
  setFiltros: (filtros: Partial<FiltrosClientes>) => void;
  resetFiltros: () => void;
}

export const useClientesStore = create<ClientesStore>((set) => ({
  filtros: {},
  setFiltros: (newFiltros) =>
    set((state) => ({
      filtros: { ...state.filtros, ...newFiltros },
    })),
  resetFiltros: () => set({ filtros: {} }),
}));

