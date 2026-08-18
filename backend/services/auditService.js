import AuditLog from "../models/AuditLog.js";
import logger from '../utils/logger.js';

export async function logAction(req, { action, module, resourceId = null, description, status = 'SUCCESS', userOverride = null }) {
  try {
    const actor = userOverride || req.user || {};

    await AuditLog.create({
      userId: actor.id ?? null,
      userName: actor.name ?? null,
      userEmail: actor.email ?? null,
      action,
      module,
      resourceId: resourceId !== null ? String(resourceId) : null,
      description,
      status,
      // Sin `ipAddress`: es un dato personal y la trazabilidad la dan userId,
      // userName y userEmail. Ver la migración drop-audit-ip.
      userAgent: req.get('User-Agent') || null,
    });
  } catch (error) {
    logger.error('Error registrando auditoría:', error);
  }
}
