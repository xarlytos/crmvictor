import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EventType, CalendarEvent } from '@/types';

// Tipos de evento por defecto
const defaultEventTypes: EventType[] = [
  {
    id: 'default-1',
    name: 'Reunión',
    color: '#3b82f6', // blue-500
    icon: 'users',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'default-2',
    name: 'Entrenamiento',
    color: '#22c55e', // green-500
    icon: 'dumbbell',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'default-3',
    name: 'Consulta',
    color: '#f97316', // orange-500
    icon: 'message-circle',
    createdAt: new Date().toISOString(),
  },
];

interface CalendarioStore {
  // Estado
  eventTypes: EventType[];
  events: CalendarEvent[];
  currentDate: Date;

  // Acciones de navegación
  setCurrentDate: (date: Date) => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToToday: () => void;

  // Acciones de tipos de evento
  addEventType: (eventType: Omit<EventType, 'id' | 'createdAt'>) => void;
  updateEventType: (id: string, updates: Partial<Omit<EventType, 'id' | 'createdAt'>>) => void;
  deleteEventType: (id: string) => void;

  // Acciones de eventos
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => string;
  updateEvent: (id: string, updates: Partial<Omit<CalendarEvent, 'id' | 'createdAt'>>) => void;
  deleteEvent: (id: string) => void;

  // Getters
  getEventsByDate: (date: string) => CalendarEvent[];
  getEventsByMonth: (year: number, month: number) => CalendarEvent[];
  getEventTypeById: (id: string) => EventType | undefined;
  checkOverlap: (date: string, startTime: string, endTime: string, excludeId?: string) => boolean;
}

export const useCalendarioStore = create<CalendarioStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      eventTypes: defaultEventTypes,
      events: [],
      currentDate: new Date(),

      // Navegación
      setCurrentDate: (date) => set({ currentDate: date }),

      goToPreviousMonth: () =>
        set((state) => ({
          currentDate: new Date(
            state.currentDate.getFullYear(),
            state.currentDate.getMonth() - 1,
            1
          ),
        })),

      goToNextMonth: () =>
        set((state) => ({
          currentDate: new Date(
            state.currentDate.getFullYear(),
            state.currentDate.getMonth() + 1,
            1
          ),
        })),

      goToToday: () => set({ currentDate: new Date() }),

      // CRUD Tipos de Evento
      addEventType: (eventType) =>
        set((state) => ({
          eventTypes: [
            ...state.eventTypes,
            {
              ...eventType,
              id: `et-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateEventType: (id, updates) =>
        set((state) => ({
          eventTypes: state.eventTypes.map((et) =>
            et.id === id ? { ...et, ...updates } : et
          ),
        })),

      deleteEventType: (id) =>
        set((state) => ({
          eventTypes: state.eventTypes.filter((et) => et.id !== id),
          // Al eliminar un tipo, actualizar eventos que lo usaban a null o tipo por defecto
          events: state.events.map((e) =>
            e.typeId === id ? { ...e, typeId: 'default-1' } : e
          ),
        })),

      // CRUD Eventos
      addEvent: (event) => {
        const id = `ev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        set((state) => ({
          events: [
            ...state.events,
            {
              ...event,
              id,
              createdAt: new Date().toISOString(),
            },
          ],
        }));
        return id;
      },

      updateEvent: (id, updates) =>
        set((state) => ({
          events: state.events.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        })),

      deleteEvent: (id) =>
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        })),

      // Getters
      getEventsByDate: (date) => {
        return get()
          .events.filter((e) => e.date === date)
          .sort((a, b) => a.startTime.localeCompare(b.startTime));
      },

      getEventsByMonth: (year, month) => {
        return get().events.filter((e) => {
          const eventDate = new Date(e.date);
          return (
            eventDate.getFullYear() === year &&
            eventDate.getMonth() === month
          );
        });
      },

      getEventTypeById: (id) => {
        return get().eventTypes.find((et) => et.id === id);
      },

      checkOverlap: (date, startTime, endTime, excludeId) => {
        const events = get().events.filter(
          (e) => e.date === date && e.id !== excludeId
        );

        return events.some((e) => {
          // Convertir horas a minutos para comparar
          const startMinutes = timeToMinutes(startTime);
          const endMinutes = timeToMinutes(endTime);
          const eventStart = timeToMinutes(e.startTime);
          const eventEnd = timeToMinutes(e.endTime);

          // Hay solapamiento si:
          // El nuevo evento empieza antes de que termine el existente Y
          // El nuevo evento termina después de que empiece el existente
          return startMinutes < eventEnd && endMinutes > eventStart;
        });
      },
    }),
    {
      name: 'calendario-storage',
      partialize: (state) => ({
        eventTypes: state.eventTypes,
        events: state.events,
      }),
    }
  )
);

// Helper para convertir "HH:mm" a minutos
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}
