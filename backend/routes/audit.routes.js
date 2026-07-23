import express from 'express';
import rateLimit from 'express-rate-limit';
import { getAuditLogs, logDownload } from '../controllers/AuditController.js';
import { authMiddleware, requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

const auditRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 solicitudes por ventana por IP
  standardHeaders: true,
  legacyHeaders: false
});

// 📜 Listar bitácora de auditoría (solo admin)
router.get('/', auditRateLimiter, authMiddleware, requireAdmin, getAuditLogs);

// ⬇️ Registrar una descarga de reporte
router.post('/log-download', auditRateLimiter, authMiddleware, logDownload);

export default router;
