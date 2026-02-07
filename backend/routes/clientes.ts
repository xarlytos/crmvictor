import { Router } from 'express';
import {
  listClientes,
  getCliente,
  createCliente,
  updateCliente,
  deleteCliente,
  deleteMultipleClientes,
} from '../controllers/clientes.controller';
import { authMiddleware } from '../middleware/auth';

export const clientesRouter = Router();

// Todas las rutas requieren autenticación
clientesRouter.use(authMiddleware);

clientesRouter.get('/', listClientes);
clientesRouter.get('/:id', getCliente);
clientesRouter.post('/', createCliente);
clientesRouter.put('/:id', updateCliente);
clientesRouter.delete('/:id', deleteCliente);
clientesRouter.post('/bulk-delete', deleteMultipleClientes);
