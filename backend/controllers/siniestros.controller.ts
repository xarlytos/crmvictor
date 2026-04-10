import { Request, Response } from 'express';
import SiniestroGrupo from '../models/SiniestroGrupo';

export const siniestrosController = {
  // Listar todos los grupos con filtros
  async listar(req: Request, res: Response) {
    try {
      const { search, estado, valoracion } = req.query;

      let query: any = {};

      // Filtro por búsqueda (empieza por)
      if (search && typeof search === 'string') {
        query['empresa.nombre'] = { $regex: '^' + search, $options: 'i' };
      }

      // Filtro por estado
      if (estado && (estado === 'abierto' || estado === 'cerrado')) {
        query['siniestros.estado'] = estado;
      }

      // Filtro por valoración
      if (valoracion && ['positiva', 'intermedia', 'negativa'].includes(valoracion as string)) {
        query['siniestros.valoracion'] = valoracion;
      }

      const grupos = await SiniestroGrupo.find(query).sort({ updatedAt: -1 });

      res.json({ success: true, data: grupos });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error al listar siniestros' });
    }
  },

  // Obtener un grupo por ID
  async obtenerPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const grupo = await SiniestroGrupo.findById(id);

      if (!grupo) {
        return res.status(404).json({ success: false, error: 'Grupo no encontrado' });
      }

      res.json({ success: true, data: grupo });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error al obtener siniestro' });
    }
  },

  // Crear nuevo grupo
  async crear(req: Request, res: Response) {
    try {
      const { clienteId, empresa } = req.body;

      // Verificar si ya existe un grupo para este cliente
      const existente = await SiniestroGrupo.findOne({ clienteId });
      if (existente) {
        return res.status(400).json({
          success: false,
          error: 'Ya existe un historial para este cliente'
        });
      }

      const grupo = new SiniestroGrupo({
        clienteId,
        empresa,
        observacionesGenerales: '',
        siniestros: [],
      });

      await grupo.save();
      res.status(201).json({ success: true, data: grupo });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error al crear siniestro' });
    }
  },

  // Actualizar grupo
  async actualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const grupo = await SiniestroGrupo.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true }
      );

      if (!grupo) {
        return res.status(404).json({ success: false, error: 'Grupo no encontrado' });
      }

      res.json({ success: true, data: grupo });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error al actualizar siniestro' });
    }
  },

  // Eliminar grupo
  async eliminar(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const grupo = await SiniestroGrupo.findByIdAndDelete(id);

      if (!grupo) {
        return res.status(404).json({ success: false, error: 'Grupo no encontrado' });
      }

      res.json({ success: true, message: 'Grupo eliminado' });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error al eliminar siniestro' });
    }
  },

  // Añadir siniestro a un grupo
  async agregarSiniestro(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const siniestroData = req.body;

      const grupo = await SiniestroGrupo.findById(id);

      if (!grupo) {
        return res.status(404).json({ success: false, error: 'Grupo no encontrado' });
      }

      grupo.siniestros.push(siniestroData);
      grupo.updatedAt = new Date();
      await grupo.save();

      // Devolver el último siniestro añadido (con el ID generado)
      const nuevoSiniestro = grupo.siniestros[grupo.siniestros.length - 1];

      res.status(201).json({ success: true, data: nuevoSiniestro });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error al agregar siniestro' });
    }
  },

  // Actualizar siniestro
  async actualizarSiniestro(req: Request, res: Response) {
    try {
      const { id, siniestroId } = req.params;
      const updates = req.body;

      const grupo = await SiniestroGrupo.findById(id);

      if (!grupo) {
        return res.status(404).json({ success: false, error: 'Grupo no encontrado' });
      }

      const siniestro = grupo.siniestros.id(siniestroId);

      if (!siniestro) {
        return res.status(404).json({ success: false, error: 'Siniestro no encontrado' });
      }

      // Actualizar campos
      Object.assign(siniestro, updates, { updatedAt: new Date() });
      grupo.updatedAt = new Date();

      await grupo.save();

      res.json({ success: true, data: siniestro });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error al actualizar siniestro' });
    }
  },

  // Eliminar siniestro
  async eliminarSiniestro(req: Request, res: Response) {
    try {
      const { id, siniestroId } = req.params;

      const grupo = await SiniestroGrupo.findById(id);

      if (!grupo) {
        return res.status(404).json({ success: false, error: 'Grupo no encontrado' });
      }

      grupo.siniestros = grupo.siniestros.filter(
        (s: any) => s._id.toString() !== siniestroId
      );
      grupo.updatedAt = new Date();

      await grupo.save();

      res.json({ success: true, message: 'Siniestro eliminado' });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error al eliminar siniestro' });
    }
  },
};
