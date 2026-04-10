import { useState } from 'react';
import { CalendarEvent } from '@/types';
import {
  useEventos,
  useTiposEvento,
  useCreateEvento,
  useUpdateEvento,
  useDeleteEvento,
  useCreateTipoEvento,
  useUpdateTipoEvento,
  useDeleteTipoEvento,
} from '../hooks/useCalendario';
import { CalendarMonth, MonthNavigator } from '../components/CalendarMonth';
import { EventModal } from '../components/EventModal';
import { EventTypeManager } from '../components/EventTypeManager';
import { Button } from '@/components/ui/button';
import { Settings, CalendarPlus, CalendarDays } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function CalendarioPage() {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());

  // React Query hooks
  const { data: events = [], isLoading: isLoadingEvents } = useEventos(
    currentDate.getFullYear(),
    currentDate.getMonth()
  );
  const { data: eventTypes = [], isLoading: isLoadingTypes } = useTiposEvento();

  // Mutations
  const createEvento = useCreateEvento();
  const updateEvento = useUpdateEvento();
  const deleteEvento = useDeleteEvento();
  const createTipoEvento = useCreateTipoEvento();
  const updateTipoEvento = useUpdateTipoEvento();
  const deleteTipoEvento = useDeleteTipoEvento();

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isTypeManagerOpen, setIsTypeManagerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setIsEventModalOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedDate(new Date(event.date));
    setIsEventModalOpen(true);
  };

  const handleCloseEventModal = () => {
    setIsEventModalOpen(false);
    setSelectedEvent(null);
  };

  const handleSaveEvent = async (eventData: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
    try {
      if (selectedEvent) {
        await updateEvento.mutateAsync({
          id: selectedEvent.id,
          dto: eventData,
        });
        toast({
          title: 'Evento actualizado',
          description: 'El evento se ha guardado correctamente',
        });
      } else {
        await createEvento.mutateAsync(eventData);
        toast({
          title: 'Evento creado',
          description: 'El evento se ha creado correctamente',
        });
      }
      handleCloseEventModal();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar el evento',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteEvento.mutateAsync(id);
      toast({
        title: 'Evento eliminado',
        description: 'El evento se ha eliminado correctamente',
      });
      handleCloseEventModal();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar el evento',
        variant: 'destructive',
      });
    }
  };

  const handleAddTipo = async (tipo: Omit<typeof eventTypes[0], 'id' | 'createdAt'>) => {
    try {
      await createTipoEvento.mutateAsync(tipo);
      toast({
        title: 'Tipo creado',
        description: 'El tipo de evento se ha creado correctamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear el tipo',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateTipo = async (id: string, updates: Partial<typeof eventTypes[0]>) => {
    try {
      await updateTipoEvento.mutateAsync({ id, dto: updates });
      toast({
        title: 'Tipo actualizado',
        description: 'El tipo de evento se ha actualizado correctamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar el tipo',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTipo = async (id: string) => {
    try {
      await deleteTipoEvento.mutateAsync(id);
      toast({
        title: 'Tipo eliminado',
        description: 'El tipo de evento se ha eliminado correctamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar el tipo',
        variant: 'destructive',
      });
    }
  };


  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isLoading = isLoadingEvents || isLoadingTypes;

  return (
    <div className="h-full flex flex-col space-y-6 animate-slide-up">
      {/* Header de la página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <CalendarDays className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
              Calendario
            </h1>
            <p className="text-slate-500 mt-1">
              Gestiona tus eventos y reuniones
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsTypeManagerOpen(true)}
            className="rounded-xl border-slate-200 hover:bg-slate-50 hover:border-slate-300"
          >
            <Settings className="w-4 h-4 mr-2" />
            Tipos de evento
          </Button>
          <Button
            onClick={() => {
              setSelectedDate(new Date());
              setSelectedEvent(null);
              setIsEventModalOpen(true);
            }}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300"
          >
            <CalendarPlus className="w-4 h-4 mr-2" />
            Nuevo evento
          </Button>
        </div>
      </div>

      {/* Navegador de mes */}
      <MonthNavigator
        currentDate={currentDate}
        onPreviousMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
        onToday={goToToday}
      />

      {/* Calendario */}
      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <CalendarMonth
            currentDate={currentDate}
            events={events}
            eventTypes={eventTypes}
            onEventClick={handleEventClick}
            onDayClick={handleDayClick}
          />
        )}
      </div>

      {/* Modales */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={handleCloseEventModal}
        event={selectedEvent}
        selectedDate={selectedDate}
        eventTypes={eventTypes}
        onSave={handleSaveEvent}
        onDelete={selectedEvent ? handleDeleteEvent : undefined}
      />

      <EventTypeManager
        isOpen={isTypeManagerOpen}
        onClose={() => setIsTypeManagerOpen(false)}
        eventTypes={eventTypes}
        onAdd={handleAddTipo}
        onUpdate={handleUpdateTipo}
        onDelete={handleDeleteTipo}
      />
    </div>
  );
}
