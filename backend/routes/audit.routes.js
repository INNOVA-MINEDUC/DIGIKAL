import express from 'express';
import { getAuditLogs, logDownload } from '../controllers/AuditController.js';
import { authMiddleware, requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// 📜 Listar bitácora de auditoría (solo admin)
router.get('/', authMiddleware, requireAdmin, getAuditLogs);

// ⬇️ Registrar una descarga de reporte
router.post('/log-download', authMiddleware, logDownload);

export default router;
