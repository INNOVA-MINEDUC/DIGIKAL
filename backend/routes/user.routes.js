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
// El limitador va antes de `authMiddleware` a propósito: ese middleware
// consulta la base en cada petición, así que sin tope alguien sin sesión podría
// forzar una consulta por intento (CodeQL: missing rate limiting).
// Al estar aquí ya cubre todas las rutas del router; repetirlo abajo consumía
// dos cupos por petición y dejaba el límite real en la mitad.
router.use(apiLimiter, authMiddleware, requireAdmin);

router.get('/', getUsers);
router.get('/:id', getUserById);

router.post('/', escrituraLimiter, createUser);
router.put('/:id', escrituraLimiter, updateUser);
router.delete('/:id', escrituraLimiter, deleteUser);

export default router;
