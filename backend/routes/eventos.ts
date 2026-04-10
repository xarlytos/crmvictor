import { Router } from 'express';
import { eventosController } from '../controllers/eventos.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// CRUD Eventos
router.get('/', eventosController.listarEventos);
router.get('/:id', eventosController.obtenerEvento);
router.post('/', eventosController.crearEvento);
router.put('/:id', eventosController.actualizarEvento);
router.delete('/:id', eventosController.eliminarEvento);

// CRUD Tipos de Evento
router.get('/tipos/list', eventosController.listarTipos);
router.post('/tipos', eventosController.crearTipo);
router.put('/tipos/:id', eventosController.actualizarTipo);
router.delete('/tipos/:id', eventosController.eliminarTipo);

export default router;
