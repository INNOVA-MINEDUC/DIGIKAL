import express from 'express';
import rateLimit from 'express-rate-limit';
import rateLimit from 'express-rate-limit';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/UserController.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();
const userRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 solicitudes por IP en la ventana
  standardHeaders: true,
  legacyHeaders: false
});

router.use(userRateLimiter);

const userRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 solicitudes por IP en la ventana
});

router.use(userRateLimiter);

// 🔍 Obtener todos los usuarios
router.get('/', authMiddleware, getUsers);

// 🔍 Obtener un usuario por ID
router.get('/:id', authMiddleware, getUserById);

// ➕ Crear usuario
router.post('/', authMiddleware, createUser);

// ✏️ Actualizar usuario
router.put('/:id', authMiddleware, updateUser);

// ❌ Eliminar usuario
router.delete('/:id', authMiddleware, deleteUser);


export default router;