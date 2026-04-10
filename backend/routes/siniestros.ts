import { Router } from 'express';
import { siniestrosController } from '../controllers/siniestros.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// CRUD Grupos
router.get('/', siniestrosController.listar);
router.get('/:id', siniestrosController.obtenerPorId);
router.post('/', siniestrosController.crear);
router.put('/:id', siniestrosController.actualizar);
router.delete('/:id', siniestrosController.eliminar);

// CRUD Siniestros dentro de un grupo
router.post('/:id/siniestros', siniestrosController.agregarSiniestro);
router.put('/:id/siniestros/:siniestroId', siniestrosController.actualizarSiniestro);
router.delete('/:id/siniestros/:siniestroId', siniestrosController.eliminarSiniestro);

export default router;
