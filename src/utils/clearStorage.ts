// Utilidad para limpiar localStorage y regenerar datos
export function clearStorage() {
  localStorage.removeItem('crm_seguros_data');
  localStorage.removeItem('crm_seguros_config');
  console.log('Storage limpiado. Recarga la página para regenerar datos.');
  window.location.reload();
}

// Ejecutar en consola: clearStorage()

