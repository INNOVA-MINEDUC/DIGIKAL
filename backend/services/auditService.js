import AuditLog from "../models/AuditLog.js";

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
      ipAddress: req.ip,
      userAgent: req.get('User-Agent') || null,
    });
  } catch (error) {
    console.error('Error registrando auditoría:', error);
  }
}
