import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/UserController.js';

const router = express.Router();


// 🔍 Obtener todos los usuarios
router.get('/', getUsers);

// 🔍 Obtener un usuario por ID
router.get('/:id', getUserById);

// ➕ Crear usuario
router.post('/', createUser);

// ✏️ Actualizar usuario
router.put('/:id', updateUser);

// ❌ Eliminar usuario
router.delete('/:id', deleteUser);


export default router;