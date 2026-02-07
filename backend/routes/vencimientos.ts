import { Router } from 'express';
import { listVencimientos, getVencimientosResumen } from '../controllers/vencimientos.controller';
import { authMiddleware } from '../middleware/auth';

export const vencimientosRouter = Router();

// Todas las rutas requieren autenticación
vencimientosRouter.use(authMiddleware);

vencimientosRouter.get('/', listVencimientos);
vencimientosRouter.get('/resumen', getVencimientosResumen);
