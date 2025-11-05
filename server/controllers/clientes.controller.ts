import { Request, Response } from 'express';
import { ClienteModel } from '../models/Cliente';
import type { Cliente, FiltrosClientes } from '../../src/types';

export const listClientes = async (req: Request, res: Response) => {
  try {
    const filters: FiltrosClientes = {
      search: req.query.search as string,
      estados: req.query.estados ? (req.query.estados as string).split(',') as any : undefined,
      tiposCarga: req.query.tiposCarga ? (req.query.tiposCarga as string).split(',') as any : undefined,
      transportes: req.query.transportes ? (req.query.transportes as string).split(',') as any : undefined,
      mesVencimiento: req.query.mesVencimiento ? Number(req.query.mesVencimiento) : undefined,
    };

    let query: any = {};

    if (filters.search) {
      query.$or = [
        { empresa: { $regex: filters.search, $options: 'i' } },
        { contacto: { $regex: filters.search, $options: 'i' } },
        { telefono: { $regex: filters.search, $options: 'i' } },
        { correo: { $regex: filters.search, $options: 'i' } },
      ];
    }

    if (filters.estados && filters.estados.length > 0) {
      query.estado = { $in: filters.estados };
    }

    if (filters.tiposCarga && filters.tiposCarga.length > 0) {
      query.tipoCarga = { $in: filters.tiposCarga };
    }

    if (filters.transportes && filters.transportes.length > 0) {
      query.transporte = { $in: filters.transportes };
    }

    if (filters.mesVencimiento) {
      const startOfMonth = new Date(new Date().getFullYear(), filters.mesVencimiento - 1, 1);
      const endOfMonth = new Date(new Date().getFullYear(), filters.mesVencimiento, 0, 23, 59, 59);
      query['poliza.fechaFin'] = { $gte: startOfMonth, $lte: endOfMonth };
    }

    const clientes = await ClienteModel.find(query).lean();
    const total = clientes.length;

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

    res.json({ items: formatted, total });
  } catch (error) {
    res.status(500).json({ error: 'Error al listar clientes' });
  }
};

export const getCliente = async (req: Request, res: Response) => {
  try {
    const cliente = await ClienteModel.findById(req.params.id).lean();
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const formatted: Cliente = {
      id: cliente._id.toString(),
      empresa: cliente.empresa,
      contacto: cliente.contacto,
      telefono: cliente.telefono,
      correo: cliente.correo,
      direccion: cliente.direccion,
      notas: cliente.notas,
      estado: cliente.estado,
      tipoCarga: cliente.tipoCarga,
      transporte: cliente.transporte,
      poliza: {
        aseguradora: cliente.poliza.aseguradora,
        numPoliza: cliente.poliza.numPoliza,
        fechaInicio: cliente.poliza.fechaInicio.toISOString(),
        fechaFin: cliente.poliza.fechaFin.toISOString(),
        prima: cliente.poliza.prima,
      },
      createdAt: cliente.createdAt.toISOString(),
      updatedAt: cliente.updatedAt.toISOString(),
    };

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
};

export const createCliente = async (req: Request, res: Response) => {
  try {
    const clienteData = req.body;
    const cliente = new ClienteModel(clienteData);
    await cliente.save();

    const formatted: Cliente = {
      id: cliente._id.toString(),
      empresa: cliente.empresa,
      contacto: cliente.contacto,
      telefono: cliente.telefono,
      correo: cliente.correo,
      direccion: cliente.direccion,
      notas: cliente.notas,
      estado: cliente.estado,
      tipoCarga: cliente.tipoCarga,
      transporte: cliente.transporte,
      poliza: {
        aseguradora: cliente.poliza.aseguradora,
        numPoliza: cliente.poliza.numPoliza,
        fechaInicio: cliente.poliza.fechaInicio.toISOString(),
        fechaFin: cliente.poliza.fechaFin.toISOString(),
        prima: cliente.poliza.prima,
      },
      createdAt: cliente.createdAt.toISOString(),
      updatedAt: cliente.updatedAt.toISOString(),
    };

    res.status(201).json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear cliente' });
  }
};

export const updateCliente = async (req: Request, res: Response) => {
  try {
    const cliente = await ClienteModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).lean();

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const formatted: Cliente = {
      id: cliente._id.toString(),
      empresa: cliente.empresa,
      contacto: cliente.contacto,
      telefono: cliente.telefono,
      correo: cliente.correo,
      direccion: cliente.direccion,
      notas: cliente.notas,
      estado: cliente.estado,
      tipoCarga: cliente.tipoCarga,
      transporte: cliente.transporte,
      poliza: {
        aseguradora: cliente.poliza.aseguradora,
        numPoliza: cliente.poliza.numPoliza,
        fechaInicio: cliente.poliza.fechaInicio.toISOString(),
        fechaFin: cliente.poliza.fechaFin.toISOString(),
        prima: cliente.poliza.prima,
      },
      createdAt: cliente.createdAt.toISOString(),
      updatedAt: cliente.updatedAt.toISOString(),
    };

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
};

export const deleteCliente = async (req: Request, res: Response) => {
  try {
    const cliente = await ClienteModel.findByIdAndDelete(req.params.id);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
};

