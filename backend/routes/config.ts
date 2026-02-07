import { Router } from 'express';
import { getConfig, updateConfig } from '../controllers/config.controller';
import { authMiddleware } from '../middleware/auth';

export const configRouter = Router();

// Todas las rutas requieren autenticación
configRouter.use(authMiddleware);

configRouter.get('/', getConfig);
configRouter.put('/', updateConfig);
