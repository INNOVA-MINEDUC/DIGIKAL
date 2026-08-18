import express from 'express';
import { getTiposEquipo } from '../controllers/TipoEquipoController.js';
import { apiLimiter } from '../middlewares/rateLimit.middleware.js';
import { requireRoles } from '../middlewares/auth.middleware.js';
import { ROLES_DOTACION } from '../config/env.js';

const router = express.Router();

// Detrás de la barrera de autenticación de app.js. Catálogo de sólo lectura que
// necesita el formulario de dotaciones.
router.get('/', apiLimiter, requireRoles(...ROLES_DOTACION), getTiposEquipo);

export default router;
