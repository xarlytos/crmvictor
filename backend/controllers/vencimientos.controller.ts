import { Request, Response } from 'express';
import { ClienteModel } from '../models/Cliente';
import type { Cliente, EstadoCliente } from '../../src/types';

// Helper para formatear cliente (mismo que en clientes.controller)
const formatCliente = (doc: any): Cliente => ({
  id: doc._id?.toString() || doc.id,
  empresa: doc.empresa,
  contacto: doc.contacto,
  cif: doc.cif,
  telefono: doc.telefono,
  correo: doc.correo,
  direccion: doc.direccion,
  notas: doc.notas,
  estado: doc.estado,
  tipoCarga: doc.tipoCarga,
  transporte: doc.transporte,
  poliza: doc.poliza ? {
    aseguradora: doc.poliza.aseguradora,
    numPoliza: doc.poliza.numPoliza,
    fechaInicio: doc.poliza.fechaInicio instanceof Date 
      ? doc.poliza.fechaInicio.toISOString() 
      : doc.poliza.fechaInicio,
    fechaFin: doc.poliza.fechaFin instanceof Date 
      ? doc.poliza.fechaFin.toISOString() 
      : doc.poliza.fechaFin,
    prima: doc.poliza.prima,
  } : undefined,
  vencimientos: doc.vencimientos ? {
    rc: doc.vencimientos.rc,
    mercancias: doc.vencimientos.mercancias,
    acc: doc.vencimientos.acc,
    flotas: doc.vencimientos.flotas,
    pyme: doc.vencimientos.pyme,
  } : undefined,
  numVehiculos: doc.numVehiculos,
  facturacion: doc.facturacion,
  fechaLlamada: doc.fechaLlamada,
  estadoConversacion: doc.estadoConversacion,
  createdAt: doc.createdAt instanceof Date 
    ? doc.createdAt.toISOString() 
    : doc.createdAt,
  updatedAt: doc.updatedAt instanceof Date 
    ? doc.updatedAt.toISOString() 
    : doc.updatedAt,
});

export const listVencimientos = async (req: Request, res: Response): Promise<void> => {
  try {
    const days = req.query.days ? Number(req.query.days) : undefined;
    const mes = req.query.mes ? Number(req.query.mes) : undefined;
    const estado = req.query.estado as EstadoCliente | undefined;

    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + (days || 365));

    // Construir query para buscar clientes con vencimientos próximos
    // Consideramos tanto la fechaFin de la póliza como los vencimientos individuales
    const orConditions: any[] = [
      { 'poliza.fechaFin': { $gte: now } },
    ];

    // Añadir condiciones para cada tipo de vencimiento
    const vencimientoFields = ['rc', 'mercancias', 'acc', 'flotas', 'pyme'];
    vencimientoFields.forEach(field => {
      orConditions.push({ [`vencimientos.${field}`]: { $exists: true, $ne: null } });
    });

    let query: any = {
      $or: orConditions
    };

    // Filtrar por estado si se proporciona
    if (estado) {
      query.estado = estado;
    }

    const clientes = await ClienteModel.find(query).lean();

    // Filtrar y ordenar por proximidad de vencimiento
    let filtered = clientes.filter((c: any) => {
      const allDates: Date[] = [];
      
      // Fecha de fin de póliza
      if (c.poliza?.fechaFin) {
        allDates.push(new Date(c.poliza.fechaFin));
      }
      
      // Vencimientos individuales
      if (c.vencimientos) {
        vencimientoFields.forEach(field => {
          const dateStr = c.vencimientos[field];
          if (dateStr) {
            allDates.push(new Date(dateStr));
          }
        });
      }

      // Verificar si hay alguna fecha en el futuro
      return allDates.some(d => d.getTime() >= now.getTime());
    });

    // Filtrar por días si se especifica
    if (days !== undefined) {
      filtered = filtered.filter((c: any) => {
        const allDates: Date[] = [];
        
        if (c.poliza?.fechaFin) {
          allDates.push(new Date(c.poliza.fechaFin));
        }
        
        if (c.vencimientos) {
          vencimientoFields.forEach(field => {
            const dateStr = c.vencimientos[field];
            if (dateStr) {
              allDates.push(new Date(dateStr));
            }
          });
        }

        const futureLimit = new Date();
        futureLimit.setDate(futureLimit.getDate() + days);

        return allDates.some(d => {
          const timeDiff = d.getTime() - now.getTime();
          const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
          return daysDiff >= 0 && daysDiff <= days;
        });
      });
    }

    // Filtrar por mes si se especifica
    if (mes) {
      filtered = filtered.filter((c: any) => {
        const allDates: Date[] = [];
        
        if (c.poliza?.fechaFin) {
          allDates.push(new Date(c.poliza.fechaFin));
        }
        
        if (c.vencimientos) {
          vencimientoFields.forEach(field => {
            const dateStr = c.vencimientos[field];
            if (dateStr) {
              allDates.push(new Date(dateStr));
            }
          });
        }

        return allDates.some(d => d.getMonth() + 1 === mes);
      });
    }

    // Ordenar por la fecha de vencimiento más próxima
    filtered.sort((a: any, b: any) => {
      const getMinDays = (c: any) => {
        const allDates: Date[] = [];
        
        if (c.poliza?.fechaFin) {
          allDates.push(new Date(c.poliza.fechaFin));
        }
        
        if (c.vencimientos) {
          vencimientoFields.forEach(field => {
            const dateStr = c.vencimientos[field];
            if (dateStr) {
              allDates.push(new Date(dateStr));
            }
          });
        }

        if (allDates.length === 0) return Infinity;
        
        return Math.min(...allDates.map(d => {
          const timeDiff = d.getTime() - now.getTime();
          return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        }));
      };

      return getMinDays(a) - getMinDays(b);
    });

    const formatted: Cliente[] = filtered.map(formatCliente);

    res.json(formatted);
  } catch (error) {
    console.error('Error listVencimientos:', error);
    res.status(500).json({ error: 'Error al listar vencimientos' });
  }
};

// Obtener resumen de vencimientos para el dashboard
export const getVencimientosResumen = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const treintaDias = new Date();
    treintaDias.setDate(treintaDias.getDate() + 30);
    
    const sesentaDias = new Date();
    sesentaDias.setDate(sesentaDias.getDate() + 60);

    // Clientes con vencimientos en los próximos 30 días
    const vencimientos30 = await ClienteModel.countDocuments({
      'poliza.fechaFin': { $gte: now, $lte: treintaDias }
    });

    // Clientes con vencimientos en los próximos 60 días
    const vencimientos60 = await ClienteModel.countDocuments({
      'poliza.fechaFin': { $gte: now, $lte: sesentaDias }
    });

    // Total de clientes
    const totalClientes = await ClienteModel.countDocuments();

    // Clientes contratados
    const clientesContratados = await ClienteModel.countDocuments({
      estado: 'contratado'
    });

    // Clientes en negociación
    const clientesNegociacion = await ClienteModel.countDocuments({
      estado: 'en_negociacion'
    });

    res.json({
      vencimientos30Dias: vencimientos30,
      vencimientos60Dias: vencimientos60,
      totalClientes,
      clientesContratados,
      clientesNegociacion,
    });
  } catch (error) {
    console.error('Error getVencimientosResumen:', error);
    res.status(500).json({ error: 'Error al obtener resumen de vencimientos' });
  }
};
