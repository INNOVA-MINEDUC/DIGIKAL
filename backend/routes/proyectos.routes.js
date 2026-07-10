import express from 'express';
import {
  obtenerProyectos,
  crearProyecto
} from '../controllers/ProyectoController.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();


router.get('/', obtenerProyectos);

router.post('/', authMiddleware, crearProyecto);




export default router;
