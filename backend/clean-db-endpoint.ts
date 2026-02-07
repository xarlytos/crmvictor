// Endpoint temporal para limpiar la base de datos desde el navegador
// Este archivo es solo para uso durante el setup inicial

import { Request, Response } from 'express';
import { ClienteModel } from './models/Cliente';

export const cleanAllClientes = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🗑️  Limpiando todos los clientes...');
    
    // Eliminar todos los clientes
    const result = await ClienteModel.deleteMany({});
    
    console.log(`✅ ${result.deletedCount} clientes eliminados`);
    
    res.json({
      message: 'Base de datos limpiada exitosamente',
      deletedCount: result.deletedCount,
      note: 'Usuario admin y configuracion preservados'
    });
  } catch (error) {
    console.error('Error cleaning database:', error);
    res.status(500).json({ error: 'Error al limpiar la base de datos' });
  }
};
