/**
 * Servicio de Cron Job para actualizar vencimientos automáticamente
 * Se ejecuta todos los días a las 00:00
 */

import { ClienteModel } from '../models/Cliente';
import { 
  calcularProximoVencimiento, 
  necesitaActualizacion 
} from '../utils/vencimientos.utils';

/**
 * Actualiza todos los vencimientos vencidos de todos los clientes
 * Devuelve el número de clientes actualizados
 */
export const actualizarTodosLosVencimientos = async (): Promise<number> => {
  console.log('🔄 Iniciando actualización automática de vencimientos...');
  
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  const camposVencimiento = ['rc', 'mercancias', 'acc', 'flotas', 'pyme'];
  let clientesActualizados = 0;
  
  // Buscar todos los clientes que tengan algún vencimiento
  const clientes = await ClienteModel.find({
    $or: [
      { 'vencimientos.rc': { $exists: true, $ne: null } },
      { 'vencimientos.mercancias': { $exists: true, $ne: null } },
      { 'vencimientos.acc': { $exists: true, $ne: null } },
      { 'vencimientos.flotas': { $exists: true, $ne: null } },
      { 'vencimientos.pyme': { $exists: true, $ne: null } },
      { 'vencimientos.personalizados': { $exists: true, $not: { $size: 0 } } },
      { 'poliza.fechaFin': { $exists: true, $ne: null } }
    ]
  }).lean();
  
  console.log(`📋 Encontrados ${clientes.length} clientes con vencimientos`);
  
  for (const cliente of clientes) {
    let cambiosRealizados = false;
    const updates: any = {};
    
    // Verificar vencimientos estándar
    if (cliente.vencimientos) {
      camposVencimiento.forEach(campo => {
        const fechaStr = cliente.vencimientos[campo];
        if (fechaStr && necesitaActualizacion(fechaStr)) {
          const nuevaFecha = calcularProximoVencimiento(fechaStr);
          updates[`vencimientos.${campo}`] = nuevaFecha;
          cambiosRealizados = true;
          console.log(`   📅 ${cliente.empresa} - ${campo}: ${fechaStr} → ${nuevaFecha}`);
        }
      });
      
      // Verificar vencimientos personalizados
      if (cliente.vencimientos.personalizados && Array.isArray(cliente.vencimientos.personalizados)) {
        let hayCambiosPersonalizados = false;
        const personalizadosActualizados = cliente.vencimientos.personalizados.map((v: any) => {
          if (v.fecha && necesitaActualizacion(v.fecha)) {
            hayCambiosPersonalizados = true;
            const nuevaFecha = calcularProximoVencimiento(v.fecha);
            console.log(`   📅 ${cliente.empresa} - ${v.nombre}: ${v.fecha} → ${nuevaFecha}`);
            return {
              ...v,
              fecha: nuevaFecha
            };
          }
          return v;
        });
        
        if (hayCambiosPersonalizados) {
          updates['vencimientos.personalizados'] = personalizadosActualizados;
          cambiosRealizados = true;
        }
      }
    }
    
    // Verificar fecha de fin de póliza
    if (cliente.poliza?.fechaFin) {
      const fechaFinStr = cliente.poliza.fechaFin instanceof Date 
        ? cliente.poliza.fechaFin.toISOString() 
        : cliente.poliza.fechaFin;
      
      if (necesitaActualizacion(fechaFinStr)) {
        const nuevaFecha = calcularProximoVencimiento(fechaFinStr);
        updates['poliza.fechaFin'] = nuevaFecha;
        cambiosRealizados = true;
        console.log(`   📅 ${cliente.empresa} - Póliza: ${fechaFinStr} → ${nuevaFecha}`);
      }
    }
    
    // Si hay cambios, actualizar en la base de datos
    if (cambiosRealizados) {
      try {
        await ClienteModel.findByIdAndUpdate(cliente._id, { $set: updates });
        clientesActualizados++;
      } catch (error) {
        console.error(`❌ Error al actualizar cliente ${cliente.empresa}:`, error);
      }
    }
  }
  
  console.log(`✅ Actualización completada. ${clientesActualizados} clientes actualizados.`);
  return clientesActualizados;
};

/**
 * Ejecuta una actualización inmediata de todos los vencimientos
 * Útil para ejecutar manualmente o al iniciar el servidor
 */
export const ejecutarActualizacionInmediata = async (): Promise<void> => {
  try {
    console.log('⚡ Ejecutando actualización inmediata de vencimientos...');
    const actualizados = await actualizarTodosLosVencimientos();
    console.log(`✅ Actualización inmediata completada: ${actualizados} clientes actualizados`);
  } catch (error) {
    console.error('❌ Error en actualización inmediata:', error);
  }
};
