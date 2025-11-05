import dayjs from 'dayjs';

export const formatDate = (date: string | Date): string => {
  return dayjs(date).format('DD/MM/YYYY');
};

export const getDaysUntil = (fechaFin: string): number => {
  const today = dayjs().startOf('day');
  const fin = dayjs(fechaFin).startOf('day');
  return fin.diff(today, 'day');
};

export const getMonthFromDate = (date: string | Date): number => {
  return dayjs(date).month() + 1; // 1-12
};

export const getUrgenciaColor = (dias: number): string => {
  if (dias > 30) return 'bg-green-500';
  if (dias >= 15) return 'bg-yellow-500';
  return 'bg-red-500';
};

export const getUrgenciaText = (dias: number): string => {
  if (dias > 30) return 'Baja';
  if (dias >= 15) return 'Media';
  return 'Alta';
};

// Nueva función: diffDays (alias de getDaysUntil para consistencia)
export const diffDays = (fechaFin: string): number => {
  return getDaysUntil(fechaFin);
};

// Nueva función: severityByDays - retorna severidad según días
export const severityByDays = (dias: number): 'low' | 'medium' | 'high' => {
  if (dias > 30) return 'low';
  if (dias >= 15) return 'medium';
  return 'high';
};

