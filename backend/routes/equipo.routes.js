import express from 'express';
import {
  getEquipos,
  getEquiposPorModelo,
  crearCategoriaEquipo,
  crearEquipo
} from '../controllers/EquipoController.js';
import { apiLimiter, escrituraLimiter } from '../middlewares/rateLimit.middleware.js';
import { requireRoles, requireAdmin } from '../middlewares/auth.middleware.js';
import { ROLES_DOTACION } from '../config/env.js';

const router = express.Router();

// La sesión la exige la barrera de app.js; antes el listado de equipos era
// consultable sin token.

/* ── Lectura: la necesita el formulario de dotaciones ───────────────────── */

router.get('/', apiLimiter, requireRoles(...ROLES_DOTACION), getEquipos);
router.get('/:id', apiLimiter, requireRoles(...ROLES_DOTACION), getEquiposPorModelo);

/* ── Escritura del catálogo: sólo administrador ──────────────────────────
   Dar de alta modelos y equipos es mantenimiento del catálogo, no parte de
   registrar una dotación. Antes bastaba con estar autenticado, así que
   cualquier usuario podía crear categorías y equipos. */

router.post('/categoria', escrituraLimiter, requireAdmin, crearCategoriaEquipo);
router.post('/detalle', escrituraLimiter, requireAdmin, crearEquipo);

export default router;
