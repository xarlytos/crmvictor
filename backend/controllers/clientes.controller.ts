import { Request, Response } from 'express';
import { ClienteModel } from '../models/Cliente';
import type { Cliente, FiltrosClientes } from '../../src/types';

// Helper para parsear arrays de query params
const parseQueryArray = (value: any): string[] | undefined => {
  if (!value) return undefined;
  if (Array.isArray(value)) return value as string[];
  if (typeof value === 'string') return value.split(',');
  return undefined;
};

// Helper para formatear cliente
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

export const listClientes = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters: FiltrosClientes = {
      search: req.query.search as string,
      estados: parseQueryArray(req.query.estados) as any,
      tiposCarga: parseQueryArray(req.query.tiposCarga) as any,
      transportes: parseQueryArray(req.query.transportes) as any,
      mesVencimiento: req.query.mesVencimiento ? Number(req.query.mesVencimiento) : undefined,
      proximosDias: req.query.proximosDias ? Number(req.query.proximosDias) : undefined,
    };

    let query: any = {};

    // Búsqueda por texto
    if (filters.search) {
      query.$or = [
        { empresa: { $regex: filters.search, $options: 'i' } },
        { contacto: { $regex: filters.search, $options: 'i' } },
        { telefono: { $regex: filters.search, $options: 'i' } },
        { correo: { $regex: filters.search, $options: 'i' } },
      ];
    }

    // Filtro por estados
    if (filters.estados && filters.estados.length > 0) {
      // Separar valores normales de 'sin_definir'
      const valoresNormales = filters.estados.filter(e => e !== 'sin_definir');
      const incluirSinDefinir = filters.estados.includes('sin_definir');
      
      if (valoresNormales.length > 0 && incluirSinDefinir) {
        // Ambos: estados específicos + sin definir
        query.$or = [
          { estado: { $in: valoresNormales } },
          { estado: { $in: [null, undefined, ''] } },
          { estado: { $exists: false } }
        ];
      } else if (incluirSinDefinir) {
        // Solo sin definir
        query.$or = [
          { estado: { $in: [null, undefined, ''] } },
          { estado: { $exists: false } }
        ];
      } else {
        // Solo estados específicos
        query.estado = { $in: valoresNormales };
      }
    }

    // Filtro por tipos de carga
    if (filters.tiposCarga && filters.tiposCarga.length > 0) {
      const valoresNormales = filters.tiposCarga.filter(t => t !== 'sin_definir');
      const incluirSinDefinir = filters.tiposCarga.includes('sin_definir');
      
      if (valoresNormales.length > 0 && incluirSinDefinir) {
        query.$or = [
          { tipoCarga: { $in: valoresNormales } },
          { tipoCarga: { $in: [null, undefined, ''] } },
          { tipoCarga: { $exists: false } }
        ];
      } else if (incluirSinDefinir) {
        query.$or = [
          { tipoCarga: { $in: [null, undefined, ''] } },
          { tipoCarga: { $exists: false } }
        ];
      } else {
        query.tipoCarga = { $in: valoresNormales };
      }
    }

    // Filtro por transportes
    if (filters.transportes && filters.transportes.length > 0) {
      const valoresNormales = filters.transportes.filter(t => t !== 'sin_definir');
      const incluirSinDefinir = filters.transportes.includes('sin_definir');
      
      if (valoresNormales.length > 0 && incluirSinDefinir) {
        query.$or = [
          { transporte: { $in: valoresNormales } },
          { transporte: { $in: [null, undefined, ''] } },
          { transporte: { $exists: false } }
        ];
      } else if (incluirSinDefinir) {
        query.$or = [
          { transporte: { $in: [null, undefined, ''] } },
          { transporte: { $exists: false } }
        ];
      } else {
        query.transporte = { $in: valoresNormales };
      }
    }

    // Filtro por mes de vencimiento
    if (filters.mesVencimiento) {
      const startOfMonth = new Date(new Date().getFullYear(), filters.mesVencimiento - 1, 1);
      const endOfMonth = new Date(new Date().getFullYear(), filters.mesVencimiento, 0, 23, 59, 59);
      query['poliza.fechaFin'] = { $gte: startOfMonth, $lte: endOfMonth };
    }

    const clientes = await ClienteModel.find(query).sort({ createdAt: -1 }).lean();
    const total = clientes.length;

    const formatted: Cliente[] = clientes.map(formatCliente);

    res.json({ items: formatted, total });
  } catch (error) {
    console.error('Error listClientes:', error);
    res.status(500).json({ error: 'Error al listar clientes' });
  }
};

export const getCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const cliente = await ClienteModel.findById(req.params.id).lean();
    if (!cliente) {
      res.status(404).json({ error: 'Cliente no encontrado' });
      return;
    }

    res.json(formatCliente(cliente));
  } catch (error) {
    console.error('Error getCliente:', error);
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
};

export const createCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const clienteData = req.body;

    // Validaciones básicas
    if (!clienteData.empresa || !clienteData.contacto) {
      res.status(400).json({ 
        error: 'Empresa y contacto son campos requeridos' 
      });
      return;
    }

    // Validar que la póliza tenga fechas
    if (!clienteData.poliza?.fechaInicio || !clienteData.poliza?.fechaFin) {
      res.status(400).json({ 
        error: 'Las fechas de inicio y fin de la póliza son requeridas' 
      });
      return;
    }

    const cliente = new ClienteModel(clienteData);
    await cliente.save();

    res.status(201).json(formatCliente(cliente));
  } catch (error) {
    console.error('Error createCliente:', error);
    res.status(500).json({ error: 'Error al crear cliente' });
  }
};

export const updateCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const cliente = await ClienteModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).lean();

    if (!cliente) {
      res.status(404).json({ error: 'Cliente no encontrado' });
      return;
    }

    res.json(formatCliente(cliente));
  } catch (error) {
    console.error('Error updateCliente:', error);
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
};

export const deleteCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const cliente = await ClienteModel.findByIdAndDelete(req.params.id);
    if (!cliente) {
      res.status(404).json({ error: 'Cliente no encontrado' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleteCliente:', error);
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
};

// Bulk delete
export const deleteMultipleClientes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: 'Se requiere un array de IDs' });
      return;
    }

    const result = await ClienteModel.deleteMany({ _id: { $in: ids } });

    res.json({ 
      message: 'Clientes eliminados exitosamente',
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Error deleteMultipleClientes:', error);
    res.status(500).json({ error: 'Error al eliminar clientes' });
  }
};
