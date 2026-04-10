import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataProvider } from '@/config/dataProvider';
import type { CalendarEvent, EventType } from '@/types';

const EVENTOS_KEY = 'eventos';
const TIPOS_KEY = 'tipos-evento';

// ========== EVENTOS ==========

export function useEventos(year?: number, month?: number) {
  return useQuery<CalendarEvent[]>({
    queryKey: [EVENTOS_KEY, year, month],
    queryFn: () => dataProvider.listEventos(year, month),
  });
}

export function useCreateEvento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: Omit<CalendarEvent, 'id' | 'createdAt'>) =>
      dataProvider.createEvento(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EVENTOS_KEY] });
    },
  });
}

export function useUpdateEvento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<Omit<CalendarEvent, 'id' | 'createdAt'>> }) =>
      dataProvider.updateEvento(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EVENTOS_KEY] });
    },
  });
}

export function useDeleteEvento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dataProvider.deleteEvento(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EVENTOS_KEY] });
    },
  });
}

// ========== TIPOS DE EVENTO ==========

export function useTiposEvento() {
  return useQuery<EventType[]>({
    queryKey: [TIPOS_KEY],
    queryFn: () => dataProvider.listTiposEvento(),
  });
}

export function useCreateTipoEvento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: Omit<EventType, 'id' | 'createdAt'>) =>
      dataProvider.createTipoEvento(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TIPOS_KEY] });
    },
  });
}

export function useUpdateTipoEvento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<Omit<EventType, 'id' | 'createdAt'>> }) =>
      dataProvider.updateTipoEvento(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TIPOS_KEY] });
    },
  });
}

export function useDeleteTipoEvento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dataProvider.deleteTipoEvento(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TIPOS_KEY] });
    },
  });
}
