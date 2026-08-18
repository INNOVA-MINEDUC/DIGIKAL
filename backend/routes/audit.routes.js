import express from 'express';
import { getAuditLogs, logDownload } from '../controllers/AuditController.js';
import { requireAdmin, requireRoles } from '../middlewares/auth.middleware.js';
import { apiLimiter, escrituraLimiter } from '../middlewares/rateLimit.middleware.js';
import { ROLES_DOTACION } from '../config/env.js';

const router = express.Router();

// La sesión ya la exige la barrera de app.js; el rol se comprueba aquí.

// 📜 Leer la bitácora: sólo administrador. Contiene la actividad de todos los
// usuarios, así que no la abre ni al rol `auditor`.
router.get('/', apiLimiter, requireAdmin, getAuditLogs);

// ⬇️ Registrar una descarga de reporte: lo dispara la vista "Dotaciones", así
// que lo pueden usar los mismos roles que acceden a ella.
router.post('/log-download', escrituraLimiter, requireRoles(...ROLES_DOTACION), logDownload);

export default router;
