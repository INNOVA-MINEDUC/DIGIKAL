import express from 'express';
import { getTiposEquipo } from '../controllers/TipoEquipoController.js';
import { apiLimiter } from '../middlewares/rateLimit.middleware.js';

const router = express.Router();

// Detrás de la barrera de autenticación de app.js.
router.get('/', apiLimiter, getTiposEquipo);

export default router;
