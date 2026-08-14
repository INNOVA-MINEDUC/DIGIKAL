import express from 'express';
import {
  getEscuelas,
  getEscuelaByCodigo,
  createEscuela,
  updateEscuela,
  deleteEscuela,
  getEscuelByCodigoMineduc
} from '../controllers/EscuelaController.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';
import { apiLimiter, escrituraLimiter } from '../middlewares/rateLimit.middleware.js';

const router = express.Router();

/**
 * Este archivo no tenía NINGÚN middleware: ni siquiera importaba
 * `authMiddleware`. Se escribió antes de que existiera el login y nunca se
 * revisó, así que `DELETE /api/v1/escuelas/:id` borraba establecimientos de la
 * base sin pedir credenciales, y un bucle sobre el :id vaciaba la tabla.
 *
 * La sesión ya la exige la barrera de app.js. Aquí se añade el rol para las
 * operaciones que modifican datos.
 */

/* ── Lectura: cualquier usuario con sesión ──────────────────────────────── */

router.get('/', apiLimiter, getEscuelas);
router.get('/:codigo', apiLimiter, getEscuelByCodigoMineduc);

/** Búsqueda por código UDI que usa el formulario de registro de dotaciones. */
router.post('/udi', apiLimiter, getEscuelaByCodigo);

/* ── Escritura: solo administrador ──────────────────────────────────────── */

router.post('/', escrituraLimiter, requireAdmin, createEscuela);
router.put('/:id', escrituraLimiter, requireAdmin, updateEscuela);
router.delete('/:id', escrituraLimiter, requireAdmin, deleteEscuela);

export default router;
