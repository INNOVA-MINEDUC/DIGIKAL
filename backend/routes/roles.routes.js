import express from 'express';
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole
} from '../controllers/RoleController.js';
import { authMiddleware, requireAdmin } from '../middlewares/auth.middleware.js';
import { apiLimiter, escrituraLimiter } from '../middlewares/rateLimit.middleware.js';

const router = express.Router();

// Todo el catálogo exige sesión: antes no había ningún middleware aquí.
router.use(apiLimiter, authMiddleware);

// Leer la lista la necesita el formulario de usuarios (que ya es solo admin),
// pero se deja a cualquier autenticado porque no revela nada sensible.
router.get('/', apiLimiter, getRoles);

router.get('/:id', apiLimiter, requireAdmin, getRoleById);
router.post('/', escrituraLimiter, requireAdmin, createRole);
router.put('/:id', escrituraLimiter, requireAdmin, updateRole);
router.delete('/:id', escrituraLimiter, requireAdmin, deleteRole);

export default router;
