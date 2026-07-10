import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/UserController.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();


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