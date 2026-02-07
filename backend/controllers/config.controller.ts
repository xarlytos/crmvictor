import { Request, Response } from 'express';
import { ConfigModel } from '../models/Config';
import type { ConfigUsuario } from '../../src/types';

const defaultColors: Record<number, string> = {
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
};

export const getConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    let config = await ConfigModel.findOne().lean();
    
    if (!config) {
      // Crear configuración por defecto
      const defaultConfig = new ConfigModel({
        alertWindowDays: 60,
        monthColors: defaultColors,
      });
      await defaultConfig.save();
      config = defaultConfig.toObject();
    }

    const formatted: ConfigUsuario = {
      alertWindowDays: config.alertWindowDays,
      monthColors: config.monthColors instanceof Map
        ? Object.fromEntries(config.monthColors)
        : config.monthColors || defaultColors,
    };

    res.json(formatted);
  } catch (error) {
    console.error('Error getConfig:', error);
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
};

export const updateConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const update = req.body;
    
    // Validar que alertWindowDays sea un número positivo
    if (update.alertWindowDays !== undefined) {
      if (typeof update.alertWindowDays !== 'number' || update.alertWindowDays < 1) {
        res.status(400).json({ 
          error: 'alertWindowDays debe ser un número mayor a 0' 
        });
        return;
      }
    }

    // Validar que monthColors sea un objeto válido
    if (update.monthColors !== undefined) {
      if (typeof update.monthColors !== 'object' || Array.isArray(update.monthColors)) {
        res.status(400).json({ 
          error: 'monthColors debe ser un objeto' 
        });
        return;
      }
      
      // Validar que todos los meses tengan colores válidos
      for (let i = 1; i <= 12; i++) {
        if (update.monthColors[i] && !/^#[0-9A-Fa-f]{6}$/.test(update.monthColors[i])) {
          res.status(400).json({ 
            error: `El color para el mes ${i} no es válido. Debe ser un hex código (ej: #ff0000)` 
          });
          return;
        }
      }
    }

    let config = await ConfigModel.findOne();

    if (!config) {
      config = new ConfigModel({
        alertWindowDays: 60,
        monthColors: defaultColors,
        ...update
      });
    } else {
      if (update.alertWindowDays !== undefined) {
        config.alertWindowDays = update.alertWindowDays;
      }
      if (update.monthColors !== undefined) {
        config.monthColors = update.monthColors;
      }
    }

    await config.save();

    const formatted: ConfigUsuario = {
      alertWindowDays: config.alertWindowDays,
      monthColors: config.monthColors instanceof Map
        ? Object.fromEntries(config.monthColors)
        : config.monthColors || defaultColors,
    };

    res.json(formatted);
  } catch (error) {
    console.error('Error updateConfig:', error);
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
};
