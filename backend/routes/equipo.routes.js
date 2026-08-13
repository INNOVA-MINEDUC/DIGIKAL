import express from 'express';
import {
  getEquipos,
  getEquiposPorModelo,
  crearCategoriaEquipo,
  crearEquipo
} from '../controllers/EquipoController.js';
import { apiLimiter, escrituraLimiter } from '../middlewares/rateLimit.middleware.js';

const router = express.Router();

// La sesión la exige la barrera de app.js; antes el listado de equipos era
// consultable sin token.

router.get('/', apiLimiter, getEquipos);
router.get('/:id', apiLimiter, getEquiposPorModelo);

router.post('/categoria', escrituraLimiter, crearCategoriaEquipo);
router.post('/detalle', escrituraLimiter, crearEquipo);

export default router;
