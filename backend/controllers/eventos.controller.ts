import { Request, Response } from 'express';
import { EventoModel, EventTypeModel } from '../models/Evento';

// Obtener userId del token JWT
function getUserId(req: Request): string {
  return (req as any).user?.userId || (req as any).user?.id;
}

export const eventosController = {
  // ========== EVENTOS ==========

  // Listar eventos del usuario (con filtro opcional por mes)
  async listarEventos(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const { year, month } = req.query;

      let query: any = { userId };

      // Si se proporciona año y mes, filtrar eventos de ese mes
      if (year && month) {
        const yearNum = parseInt(year as string);
        const monthNum = parseInt(month as string); // 0-11
        const startDate = new Date(yearNum, monthNum, 1).toISOString().split('T')[0];
        const endDate = new Date(yearNum, monthNum + 1, 0).toISOString().split('T')[0];
        query.date = { $gte: startDate, $lte: endDate };
      }

      const eventos = await EventoModel.find(query).sort({ date: 1, startTime: 1 });
      res.json({ success: true, data: eventos });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error al listar eventos' });
    }
  },

  // Obtener un evento por ID
  async obtenerEvento(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const { id } = req.params;

      const evento = await EventoModel.findOne({ _id: id, userId });
      if (!evento) {
        return res.status(404).json({ success: false, error: 'Evento no encontrado' });
      }

      res.json({ success: true, data: evento });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error al obtener evento' });
    }
  },

  // Crear evento
  async crearEvento(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const eventoData = req.body;

      const evento = new EventoModel({
        ...eventoData,
        userId,
      });

      await evento.save();
      res.status(201).json({ success: true, data: evento });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error al crear evento' });
    }
  },

  // Actualizar evento
  async actualizarEvento(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const { id } = req.params;
      const updates = req.body;

      const evento = await EventoModel.findOneAndUpdate(
        { _id: id, userId },
        { ...updates, updatedAt: new Date() },
        { new: true }
      );

      if (!evento) {
        return res.status(404).json({ success: false, error: 'Evento no encontrado' });
      }

      res.json({ success: true, data: evento });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error al actualizar evento' });
    }
  },

  // Eliminar evento
  async eliminarEvento(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const { id } = req.params;

      const evento = await EventoModel.findOneAndDelete({ _id: id, userId });
      if (!evento) {
        return res.status(404).json({ success: false, error: 'Evento no encontrado' });
      }

      res.json({ success: true, message: 'Evento eliminado' });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error al eliminar evento' });
    }
  },

  // ========== TIPOS DE EVENTO ==========

  // Listar tipos de evento del usuario
  async listarTipos(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const tipos = await EventTypeModel.find({ userId }).sort({ name: 1 });
      res.json({ success: true, data: tipos });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error al listar tipos de evento' });
    }
  },

  // Crear tipo de evento
  async crearTipo(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const tipoData = req.body;

      const tipo = new EventTypeModel({
        ...tipoData,
        userId,
      });

      await tipo.save();
      res.status(201).json({ success: true, data: tipo });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error al crear tipo de evento' });
    }
  },

  // Actualizar tipo de evento
  async actualizarTipo(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const { id } = req.params;
      const updates = req.body;

      const tipo = await EventTypeModel.findOneAndUpdate(
        { _id: id, userId },
        updates,
        { new: true }
      );

      if (!tipo) {
        return res.status(404).json({ success: false, error: 'Tipo no encontrado' });
      }

      res.json({ success: true, data: tipo });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error al actualizar tipo' });
    }
  },

  // Eliminar tipo de evento
  async eliminarTipo(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const { id } = req.params;

      const tipo = await EventTypeModel.findOneAndDelete({ _id: id, userId });
      if (!tipo) {
        return res.status(404).json({ success: false, error: 'Tipo no encontrado' });
      }

      res.json({ success: true, message: 'Tipo eliminado' });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error al eliminar tipo' });
    }
  },
};
