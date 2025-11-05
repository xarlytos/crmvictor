import { Router } from 'express';
import { getConfig, updateConfig } from '../controllers/config.controller';

export const configRouter = Router();

configRouter.get('/', getConfig);
configRouter.put('/', updateConfig);

