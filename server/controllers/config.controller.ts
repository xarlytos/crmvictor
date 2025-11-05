import { Request, Response } from 'express';
import { ConfigModel } from '../models/Config';
import type { ConfigUsuario } from '../../src/types';

export const getConfig = async (req: Request, res: Response) => {
  try {
    let config = await ConfigModel.findOne().lean();
    
    if (!config) {
      // Crear configuración por defecto
      const defaultConfig = new ConfigModel({
        alertWindowDays: 60,
        monthColors: {
          1: '#ef4444',
          2: '#f97316',
          3: '#fbbf24',
          4: '#84cc16',
          5: '#22c55e',
          6: '#10b981',
          7: '#14b8a6',
          8: '#06b6d4',
          9: '#3b82f6',
          10: '#6366f1',
          11: '#8b5cf6',
          12: '#a855f7',
        },
      });
      await defaultConfig.save();
      config = defaultConfig.toObject();
    }

    const formatted: ConfigUsuario = {
      alertWindowDays: config.alertWindowDays,
      monthColors: config.monthColors instanceof Map
        ? Object.fromEntries(config.monthColors)
        : config.monthColors,
    };

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
};

export const updateConfig = async (req: Request, res: Response) => {
  try {
    const update = req.body;
    let config = await ConfigModel.findOne();

    if (!config) {
      config = new ConfigModel(update);
    } else {
      Object.assign(config, update);
    }

    await config.save();

    const formatted: ConfigUsuario = {
      alertWindowDays: config.alertWindowDays,
      monthColors: config.monthColors instanceof Map
        ? Object.fromEntries(config.monthColors)
        : config.monthColors,
    };

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
};

