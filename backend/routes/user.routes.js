import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/UserController.js';
import { authMiddleware, requireAdmin } from '../middlewares/auth.middleware.js';
import { apiLimiter, escrituraLimiter } from '../middlewares/rateLimit.middleware.js';

const router = express.Router();

/**
 * La gestión de usuarios es exclusiva del administrador.
 *
 * Antes estas rutas solo pedían `authMiddleware`: cualquier cuenta autenticada
 * —incluido el rol más bajo— podía listar la plantilla, cambiar su propio
 * `roleId` a 1 para ascender a administrador y borrar al administrador real.
 */
router.use(authMiddleware, requireAdmin);

router.get('/', apiLimiter, getUsers);
router.get('/:id', apiLimiter, getUserById);

router.post('/', escrituraLimiter, createUser);
router.put('/:id', escrituraLimiter, updateUser);
router.delete('/:id', escrituraLimiter, deleteUser);

export default router;
