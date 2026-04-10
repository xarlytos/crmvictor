// Exportar página
export { CalendarioPage } from './pages/CalendarioPage';

// Exportar componentes
export { CalendarMonth, MonthNavigator } from './components/CalendarMonth';
export { CalendarDay } from './components/CalendarDay';
export { EventItem } from './components/EventItem';
export { EventModal } from './components/EventModal';
export { EventTypeManager } from './components/EventTypeManager';

// Exportar hooks
export {
  useEventos,
  useTiposEvento,
  useCreateEvento,
  useUpdateEvento,
  useDeleteEvento,
  useCreateTipoEvento,
  useUpdateTipoEvento,
  useDeleteTipoEvento,
} from './hooks/useCalendario';
