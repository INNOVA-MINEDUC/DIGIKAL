import express from 'express';
import {
  getEquipos,
  getEquiposPorModelo,
  crearCategoriaEquipo,
  crearEquipo
} from '../controllers/EquipoController.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();


router.get('/', getEquipos);


router.get('/:id', getEquiposPorModelo);

router.post('/categoria', authMiddleware, crearCategoriaEquipo);

router.post('/detalle', authMiddleware, crearEquipo);




// /**
//  * CREATE
//  */
// router.post('/', createEntrega);

// /**
//  * UPDATE
//  */
// router.put('/:id', updateEntrega);

// /**
//  * DELETE
//  */
// router.delete('/:id', deleteEntrega);

export default router;
