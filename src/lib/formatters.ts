/**
 * Utilidades para formateo de datos
 */

export const formatPhone = (phone: string): string => {
  // Si ya tiene formato, retornar tal cual
  if (/^\+?\d{1,4}[\s-]?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}$/.test(phone)) {
    return phone;
  }
  // Formato básico: agregar espacios cada 3 dígitos
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length <= 9) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  return phone;
};

export const formatEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

/**
 * Convierte enums a etiquetas en español
 */
export const enumToLabel = {
  estado: {
    contratado: 'Contratado',
    contactado_buena_pinta: 'Contactado - Buena Pinta',
    en_negociacion: 'En Negociación',
    descartado: 'Descartado',
  },
  tipoCarga: {
    general_fraccionada: 'General Fraccionada',
    frigorifica: 'Frigorífica',
    adr_peligrosas: 'ADR Peligrosas',
    completa_ftl: 'Completa FTL',
    fraccionada_ltl: 'Fraccionada LTL',
    a_granel: 'A Granel',
    vehiculos: 'Vehículos',
  },
  transporte: {
    nacional: 'Nacional',
    internacional: 'Internacional',
    peninsula: 'Península',
  },
} as const;

