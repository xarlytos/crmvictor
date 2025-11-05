import { Router } from 'express';
import { listVencimientos } from '../controllers/vencimientos.controller';

export const vencimientosRouter = Router();

vencimientosRouter.get('/', listVencimientos);

