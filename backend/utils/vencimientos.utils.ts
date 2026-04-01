/**
 * Utilidades para el manejo automático de vencimientos anuales
 */

import { ClienteModel } from '../models/Cliente';

/**
 * Calcula la siguiente fecha válida para un vencimiento anual
 * Si la fecha ya pasó, suma años hasta que sea >= fecha actual
 */
export const calcularProximoVencimiento = (fechaStr: string): string => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  let fecha = new Date(fechaStr);
  
  // Mientras la fecha sea anterior a hoy, sumar un año
  while (fecha.getTime() < hoy.getTime()) {
    fecha.setFullYear(fecha.getFullYear() + 1);
  }
  
  return fecha.toISOString();
};

/**
 * Verifica si una fecha necesita actualización (ya pasó)
 */
export const necesitaActualizacion = (fechaStr: string): boolean => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  const fecha = new Date(fechaStr);
  return fecha.getTime() < hoy.getTime();
};

/**
 * Actualiza automáticamente los vencimientos vencidos de un cliente
 * Devuelve true si se realizaron cambios
 */
export const actualizarVencimientosCliente = async (cliente: any): Promise<boolean> => {
  const camposVencimiento = ['rc', 'mercancias', 'acc', 'flotas', 'pyme'];
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
      }
    });
    
    // Verificar vencimientos personalizados
    if (cliente.vencimientos.personalizados && Array.isArray(cliente.vencimientos.personalizados)) {
      let hayCambiosPersonalizados = false;
      const personalizadosActualizados = cliente.vencimientos.personalizados.map((v: any) => {
        if (v.fecha && necesitaActualizacion(v.fecha)) {
          hayCambiosPersonalizados = true;
          return {
            ...v,
            fecha: calcularProximoVencimiento(v.fecha)
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
    }
  }
  
  // Si hay cambios, actualizar en la base de datos
  if (cambiosRealizados && cliente._id) {
    try {
      await ClienteModel.findByIdAndUpdate(cliente._id, { $set: updates });
      console.log(`✅ Vencimientos actualizados automáticamente para cliente: ${cliente.empresa || cliente._id}`);
    } catch (error) {
      console.error('❌ Error al actualizar vencimientos:', error);
      return false;
    }
  }
  
  return cambiosRealizados;
};
