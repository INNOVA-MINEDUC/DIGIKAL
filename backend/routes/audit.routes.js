import express from 'express';
import { getAuditLogs, logDownload } from '../controllers/AuditController.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';
import { apiLimiter, escrituraLimiter } from '../middlewares/rateLimit.middleware.js';

const router = express.Router();

// La sesión ya la exige la barrera de app.js; el rol se comprueba aquí.

// 📜 Listar bitácora de auditoría (solo admin, como antes)
router.get('/', apiLimiter, requireAdmin, getAuditLogs);

// ⬇️ Registrar una descarga de reporte (cualquier usuario con sesión)
router.post('/log-download', escrituraLimiter, logDownload);

export default router;
