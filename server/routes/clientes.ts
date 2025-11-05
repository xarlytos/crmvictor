import { Router } from 'express';
import {
  listClientes,
  getCliente,
  createCliente,
  updateCliente,
  deleteCliente,
} from '../controllers/clientes.controller';

export const clientesRouter = Router();

clientesRouter.get('/', listClientes);
clientesRouter.get('/:id', getCliente);
clientesRouter.post('/', createCliente);
clientesRouter.put('/:id', updateCliente);
clientesRouter.delete('/:id', deleteCliente);

