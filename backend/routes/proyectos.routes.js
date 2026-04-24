import express from 'express';
import {
  obtenerProyectos,
  crearProyecto
} from '../controllers/ProyectoController.js';

const router = express.Router();


router.get('/', obtenerProyectos);

router.post('/create', crearProyecto);




export default router;
