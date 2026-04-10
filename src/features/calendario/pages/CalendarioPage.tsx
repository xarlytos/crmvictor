import { useState } from 'react';
import { CalendarEvent } from '@/types';
import { useCalendarioStore } from '../store/calendario.store';
import { CalendarMonth, MonthNavigator } from '../components/CalendarMonth';
import { EventModal } from '../components/EventModal';
import { EventTypeManager } from '../components/EventTypeManager';
import { Button } from '@/components/ui/button';
import { Settings, CalendarPlus } from 'lucide-react';

export function CalendarioPage() {
  const {
    currentDate,
    events,
    eventTypes,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
  } = useCalendarioStore();

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

  // Mock data para demostración inicial (solo se carga si no hay eventos)
  const loadMockData = () => {
    const { addEvent, events } = useCalendarioStore.getState();
    if (events.length > 0) return;

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    // Crear algunos eventos de ejemplo
    const mockEvents = [
      {
        title: 'Reunión de equipo',
        typeId: 'default-1',
        date: `${year}-${String(month + 1).padStart(2, '0')}-15`,
        startTime: '10:00',
        endTime: '11:00',
        description: 'Revisión de objetivos mensuales',
      },
      {
        title: 'Entrenamiento funcional',
        typeId: 'default-2',
        date: `${year}-${String(month + 1).padStart(2, '0')}-15`,
        startTime: '18:00',
        endTime: '19:30',
        description: 'Rutina de fuerza',
      },
      {
        title: 'Consulta médica',
        typeId: 'default-3',
        date: `${year}-${String(month + 1).padStart(2, '0')}-20`,
        startTime: '09:30',
        endTime: '10:30',
      },
      {
        title: 'Llamada con cliente',
        typeId: 'default-1',
        date: `${year}-${String(month + 1).padStart(2, '0')}-10`,
        startTime: '16:00',
        endTime: '16:30',
        description: 'Seguimiento de póliza',
      },
      {
        title: 'Planificación semanal',
        typeId: 'default-1',
        date: `${year}-${String(month + 1).padStart(2, '0')}-05`,
        startTime: '09:00',
        endTime: '10:00',
      },
      {
        title: 'Yoga',
        typeId: 'default-2',
        date: `${year}-${String(month + 1).padStart(2, '0')}-08`,
        startTime: '07:00',
        endTime: '08:00',
      },
    ];

    mockEvents.forEach((event) => addEvent(event));
  };

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header de la página */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendario</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus eventos y reuniones
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsTypeManagerOpen(true)}
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
          >
            <CalendarPlus className="w-4 h-4 mr-2" />
            Nuevo evento
          </Button>
          {events.length === 0 && (
            <Button variant="ghost" onClick={loadMockData}>
              Cargar datos de prueba
            </Button>
          )}
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
        <CalendarMonth
          currentDate={currentDate}
          events={events}
          eventTypes={eventTypes}
          onEventClick={handleEventClick}
          onDayClick={handleDayClick}
        />
      </div>

      {/* Modales */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={handleCloseEventModal}
        event={selectedEvent}
        selectedDate={selectedDate}
        eventTypes={eventTypes}
      />

      <EventTypeManager
        isOpen={isTypeManagerOpen}
        onClose={() => setIsTypeManagerOpen(false)}
        eventTypes={eventTypes}
      />
    </div>
  );
}
