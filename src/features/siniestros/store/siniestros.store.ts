import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  SiniestroGrupo,
  Siniestro,
  EstadoSiniestro,
  ValoracionSiniestro,
  FiltrosSiniestros,
} from '@/types';

interface SiniestrosStore {
  // Estado
  grupos: SiniestroGrupo[];
  filtros: FiltrosSiniestros;
  selectedIds: string[]; // Para descargas múltiples

  // Filtros
  setFiltros: (filtros: Partial<FiltrosSiniestros>) => void;
  resetFiltros: () => void;

  // CRUD Grupos
  addGrupo: (
    grupo: Omit<SiniestroGrupo, 'id' | 'createdAt' | 'updatedAt'>
  ) => string;
  updateGrupo: (
    id: string,
    updates: Partial<Omit<SiniestroGrupo, 'id' | 'createdAt'>>
  ) => void;
  deleteGrupo: (id: string) => void;

  // CRUD Siniestros
  addSiniestro: (
    grupoId: string,
    siniestro: Omit<Siniestro, 'id' | 'createdAt' | 'updatedAt'>
  ) => string;
  updateSiniestro: (
    grupoId: string,
    siniestroId: string,
    updates: Partial<Omit<Siniestro, 'id' | 'createdAt'>>
  ) => void;
  deleteSiniestro: (grupoId: string, siniestroId: string) => void;

  // Selección para descargas
  toggleSeleccion: (id: string) => void;
  seleccionarTodos: (ids: string[]) => void;
  deseleccionarTodos: () => void;

  // Getters
  getGruposFiltrados: () => SiniestroGrupo[];
  getGrupoById: (id: string) => SiniestroGrupo | undefined;
  getMetricas: () => { totalClientes: number; siniestrosAbiertos: number };
}

export const useSiniestrosStore = create<SiniestrosStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      grupos: [],
      filtros: {},
      selectedIds: [],

      // Filtros
      setFiltros: (newFiltros) =>
        set((state) => ({
          filtros: { ...state.filtros, ...newFiltros },
        })),

      resetFiltros: () => set({ filtros: {} }),

      // CRUD Grupos
      addGrupo: (grupo) => {
        const id = `sg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        set((state) => ({
          grupos: [
            ...state.grupos,
            {
              ...grupo,
              id,
              createdAt: now,
              updatedAt: now,
            },
          ],
        }));
        return id;
      },

      updateGrupo: (id, updates) =>
        set((state) => ({
          grupos: state.grupos.map((g) =>
            g.id === id
              ? { ...g, ...updates, updatedAt: new Date().toISOString() }
              : g
          ),
        })),

      deleteGrupo: (id) =>
        set((state) => ({
          grupos: state.grupos.filter((g) => g.id !== id),
          selectedIds: state.selectedIds.filter((sid) => sid !== id),
        })),

      // CRUD Siniestros
      addSiniestro: (grupoId, siniestro) => {
        const siniestroId = `sin-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        const now = new Date().toISOString();

        set((state) => ({
          grupos: state.grupos.map((g) =>
            g.id === grupoId
              ? {
                  ...g,
                  siniestros: [
                    ...g.siniestros,
                    {
                      ...siniestro,
                      id: siniestroId,
                      createdAt: now,
                      updatedAt: now,
                    },
                  ],
                  updatedAt: now,
                }
              : g
          ),
        }));
        return siniestroId;
      },

      updateSiniestro: (grupoId, siniestroId, updates) =>
        set((state) => ({
          grupos: state.grupos.map((g) =>
            g.id === grupoId
              ? {
                  ...g,
                  siniestros: g.siniestros.map((s) =>
                    s.id === siniestroId
                      ? { ...s, ...updates, updatedAt: new Date().toISOString() }
                      : s
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : g
          ),
        })),

      deleteSiniestro: (grupoId, siniestroId) =>
        set((state) => ({
          grupos: state.grupos.map((g) =>
            g.id === grupoId
              ? {
                  ...g,
                  siniestros: g.siniestros.filter((s) => s.id !== siniestroId),
                  updatedAt: new Date().toISOString(),
                }
              : g
          ),
        })),

      // Selección
      toggleSeleccion: (id) =>
        set((state) => ({
          selectedIds: state.selectedIds.includes(id)
            ? state.selectedIds.filter((sid) => sid !== id)
            : [...state.selectedIds, id],
        })),

      seleccionarTodos: (ids) => set({ selectedIds: ids }),

      deseleccionarTodos: () => set({ selectedIds: [] }),

      // Getters
      getGruposFiltrados: () => {
        const { grupos, filtros } = get();
        return grupos.filter((g) => {
          // Filtro por búsqueda (empieza por)
          if (filtros.search) {
            const search = filtros.search.toLowerCase();
            if (!g.empresa.nombre.toLowerCase().startsWith(search)) {
              return false;
            }
          }

          // Filtro por estado (si hay algún siniestro con ese estado)
          if (filtros.estado) {
            const hasEstado = g.siniestros.some(
              (s) => s.estado === filtros.estado
            );
            if (!hasEstado) return false;
          }

          // Filtro por valoración (si hay algún siniestro con esa valoración)
          if (filtros.valoracion) {
            const hasValoracion = g.siniestros.some(
              (s) => s.valoracion === filtros.valoracion
            );
            if (!hasValoracion) return false;
          }

          return true;
        });
      },

      getGrupoById: (id) => {
        return get().grupos.find((g) => g.id === id);
      },

      getMetricas: () => {
        const { grupos } = get();
        const totalClientes = grupos.length;
        const siniestrosAbiertos = grupos.reduce(
          (acc, g) =>
            acc + g.siniestros.filter((s) => s.estado === 'abierto').length,
          0
        );
        return { totalClientes, siniestrosAbiertos };
      },
    }),
    {
      name: 'siniestros-storage',
      partialize: (state) => ({
        grupos: state.grupos,
      }),
    }
  )
);
