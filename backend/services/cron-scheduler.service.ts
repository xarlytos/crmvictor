/**
 * Scheduler de Cron Jobs para el CRM
 * Configura y gestiona las tareas programadas
 */

import { 
  actualizarTodosLosVencimientos, 
  ejecutarActualizacionInmediata 
} from './vencimientos-cron.service';

// Variable para almacenar el intervalo del cron job
let cronInterval: NodeJS.Timeout | null = null;

/**
 * Calcula los milisegundos hasta la próxima medianoche
 */
const calcularMsHastaMedianoche = (): number => {
  const ahora = new Date();
  const medianoche = new Date(
    ahora.getFullYear(),
    ahora.getMonth(),
    ahora.getDate() + 1, // Mañana
    0, 0, 0 // 00:00:00
  );
  return medianoche.getTime() - ahora.getTime();
};

/**
 * Programa la próxima ejecución del cron job
 */
const programarProximaEjecucion = (): void => {
  const msHastaMedianoche = calcularMsHastaMedianoche();
  const horas = Math.floor(msHastaMedianoche / (1000 * 60 * 60));
  const minutos = Math.floor((msHastaMedianoche % (1000 * 60 * 60)) / (1000 * 60));
  
  console.log(`⏰ Próxima actualización de vencimientos en: ${horas}h ${minutos}m`);
  
  // Programar la ejecución a medianoche
  setTimeout(async () => {
    await actualizarTodosLosVencimientos();
    // Después de ejecutar, volver a programar para el día siguiente
    programarProximaEjecucion();
  }, msHastaMedianoche);
};

/**
 * Inicia el cron job de actualización de vencimientos
 * Se ejecuta:
 * 1. Inmediatamente al iniciar el servidor (para actualizar vencimientos vencidos)
 * 2. Todos los días a las 00:00
 */
export const iniciarCronJobs = async (): Promise<void> => {
  console.log('🕐 Iniciando Cron Jobs...');
  
  // Ejecutar inmediatamente al iniciar el servidor
  // Esto actualiza todos los vencimientos que ya están vencidos
  await ejecutarActualizacionInmediata();
  
  // Programar la ejecución diaria a las 00:00
  programarProximaEjecucion();
  
  console.log('✅ Cron Jobs iniciados correctamente');
};

/**
 * Detiene el cron job (útil para tests o reinicios)
 */
export const detenerCronJobs = (): void => {
  if (cronInterval) {
    clearTimeout(cronInterval);
    cronInterval = null;
    console.log('🛑 Cron Jobs detenidos');
  }
};
