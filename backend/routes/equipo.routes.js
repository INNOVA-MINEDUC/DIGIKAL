import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  getEquipos,
  getEquiposPorModelo,
  crearCategoriaEquipo,
  crearEquipo
} from '../controllers/EquipoController.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

const equipoRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP en la ventana
  standardHeaders: true,
  legacyHeaders: false
});

router.use(equipoRateLimiter);


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
