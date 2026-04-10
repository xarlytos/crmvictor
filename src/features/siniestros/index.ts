// Exportar página
export { SiniestrosPage } from './pages/SiniestrosPage';

// Exportar componentes
export { ClienteSelectorModal } from './components/ClienteSelectorModal';
export { SiniestrosTableModal } from './components/SiniestrosTableModal';

// Exportar hooks
export {
  useSiniestros,
  useCreateSiniestroGrupo,
  useUpdateSiniestroGrupo,
  useDeleteSiniestroGrupo,
  useAddSiniestro,
  useUpdateSiniestro,
  useDeleteSiniestro,
} from './hooks/useSiniestros';

// Exportar utilidades
export { generateSiniestroPDF } from './utils/pdfGenerator';
