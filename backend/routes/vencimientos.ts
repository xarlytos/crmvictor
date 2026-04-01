import { Router } from 'express';
import { listVencimientos, getVencimientosResumen } from '../controllers/vencimientos.controller';
import { authMiddleware } from '../middleware/auth';
import { actualizarTodosLosVencimientos } from '../services/vencimientos-cron.service';

export const vencimientosRouter = Router();

// Todas las rutas requieren autenticación
vencimientosRouter.use(authMiddleware);

vencimientosRouter.get('/', listVencimientos);
vencimientosRouter.get('/resumen', getVencimientosResumen);

// Endpoint manual para actualizar todos los vencimientos vencidos
// Útil para forzar una actualización sin esperar al cron job
vencimientosRouter.post('/actualizar-todos', async (req, res) => {
  try {
    console.log('🔄 Actualización manual de vencimientos solicitada');
    const actualizados = await actualizarTodosLosVencimientos();
    res.json({
      message: 'Actualización completada',
      clientesActualizados: actualizados,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error en actualización manual:', error);
    res.status(500).json({ error: 'Error al actualizar vencimientos' });
  }
});
