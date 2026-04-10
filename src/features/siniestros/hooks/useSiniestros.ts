import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataProvider } from '@/config/dataProvider';
import type { SiniestroGrupo, Siniestro, FiltrosSiniestros } from '@/types';

const QUERY_KEY = 'siniestros';

// Hook para listar grupos de siniestros
export function useSiniestros(filtros?: FiltrosSiniestros) {
  return useQuery<SiniestroGrupo[]>({
    queryKey: [QUERY_KEY, filtros],
    queryFn: () => dataProvider.listSiniestroGrupos(filtros),
  });
}

// Hook para obtener un grupo específico
export function useSiniestroGrupo(id: string) {
  return useQuery<SiniestroGrupo>({
    queryKey: [QUERY_KEY, id],
    queryFn: () => dataProvider.getSiniestroGrupo(id),
    enabled: !!id,
  });
}

// Mutation para crear un grupo
export function useCreateSiniestroGrupo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: Omit<SiniestroGrupo, 'id' | 'createdAt' | 'updatedAt'>) =>
      dataProvider.createSiniestroGrupo(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Mutation para actualizar un grupo
export function useUpdateSiniestroGrupo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<SiniestroGrupo> }) =>
      dataProvider.updateSiniestroGrupo(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

// Mutation para eliminar un grupo
export function useDeleteSiniestroGrupo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dataProvider.deleteSiniestroGrupo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Mutation para añadir un siniestro
export function useAddSiniestro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      grupoId,
      siniestro,
    }: {
      grupoId: string;
      siniestro: Omit<Siniestro, 'id' | 'createdAt' | 'updatedAt'>;
    }) => dataProvider.addSiniestro(grupoId, siniestro),
    onSuccess: (_, { grupoId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, grupoId] });
    },
  });
}

// Mutation para actualizar un siniestro
export function useUpdateSiniestro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      grupoId,
      siniestroId,
      updates,
    }: {
      grupoId: string;
      siniestroId: string;
      updates: Partial<Siniestro>;
    }) => dataProvider.updateSiniestro(grupoId, siniestroId, updates),
    onSuccess: (_, { grupoId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, grupoId] });
    },
  });
}

// Mutation para eliminar un siniestro
export function useDeleteSiniestro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ grupoId, siniestroId }: { grupoId: string; siniestroId: string }) =>
      dataProvider.deleteSiniestro(grupoId, siniestroId),
    onSuccess: (_, { grupoId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, grupoId] });
    },
  });
}
