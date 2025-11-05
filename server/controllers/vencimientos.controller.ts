import { Request, Response } from 'express';
import { ClienteModel } from '../models/Cliente';
import type { Cliente, EstadoCliente } from '../../src/types';

export const listVencimientos = async (req: Request, res: Response) => {
  try {
    const days = req.query.days ? Number(req.query.days) : undefined;
    const mes = req.query.mes ? Number(req.query.mes) : undefined;
    const estado = req.query.estado as EstadoCliente | undefined;

    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + (days || 365));

    let query: any = {
      'poliza.fechaFin': { $gte: now },
    };

    if (days) {
      query['poliza.fechaFin'] = { $gte: now, $lte: futureDate };
    }

    if (mes) {
      const startOfMonth = new Date(new Date().getFullYear(), mes - 1, 1);
      const endOfMonth = new Date(new Date().getFullYear(), mes, 0, 23, 59, 59);
      query['poliza.fechaFin'] = {
        ...query['poliza.fechaFin'],
        $gte: startOfMonth,
        $lte: endOfMonth,
      };
    }

    if (estado) {
      query.estado = estado;
    }

    const clientes = await ClienteModel.find(query)
      .sort({ 'poliza.fechaFin': 1 })
      .lean();

    const formatted: Cliente[] = clientes.map((c) => ({
      id: c._id.toString(),
      empresa: c.empresa,
      contacto: c.contacto,
      telefono: c.telefono,
      correo: c.correo,
      direccion: c.direccion,
      notas: c.notas,
      estado: c.estado,
      tipoCarga: c.tipoCarga,
      transporte: c.transporte,
      poliza: {
        aseguradora: c.poliza.aseguradora,
        numPoliza: c.poliza.numPoliza,
        fechaInicio: c.poliza.fechaInicio.toISOString(),
        fechaFin: c.poliza.fechaFin.toISOString(),
        prima: c.poliza.prima,
      },
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar vencimientos' });
  }
};

