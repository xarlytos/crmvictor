// Script para inicializar datos manualmente y verificar configuración
console.log('🔧 initData.ts cargado');

// Verificar que estamos usando Mock
if (import.meta.env.VITE_USE_MOCK === 'true') {
  console.log('✅ VITE_USE_MOCK está en true');
} else {
  console.warn('⚠️ VITE_USE_MOCK no está en true:', import.meta.env.VITE_USE_MOCK);
}

// Función para limpiar y reinicializar
export function initData() {
  localStorage.removeItem('crm_seguros_data');
  localStorage.removeItem('crm_seguros_config');
  console.log('✅ localStorage limpiado. Recarga la página.');
  window.location.reload();
}

// Hacer disponible globalmente para debugging
if (typeof window !== 'undefined') {
  (window as any).initData = initData;
  console.log('💡 Función initData() disponible en window.initData()');
}
