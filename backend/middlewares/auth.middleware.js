import jwt from 'jsonwebtoken'
import { JWT_SECRET, ROLES } from '../config/env.js'
import User from '../models/User.js'
import Role from '../models/Role.js'
import logger from '../utils/logger.js';

/** Datos que se cargan de la base en cada petición autenticada. */
const CONSULTA_USUARIO = {
  attributes: ['id', 'name', 'email', 'roleId', 'active', 'tokenVersion'],
  include: { model: Role, as: 'role', attributes: ['id', 'nombre'] },
};

/**
 * El secreto ya no tiene respaldo `|| "secret"`: viene de config/env.js, que
 * aborta el arranque si falta o es débil. Antes, un despliegue sin .env firmaba
 * tokens con una palabra adivinable y cualquiera podía fabricarse un admin.
 */

const extraerToken = (req) => {
  const cabecera = req.headers.authorization;
  if (!cabecera) return null;

  const [esquema, token] = cabecera.split(' ');
  if (!/^Bearer$/i.test(esquema) || !token) return null;

  return token.trim() || null;
};

/**
 * Verifica la firma y además que la sesión siga siendo válida contra la base:
 * un token bien firmado no basta si el usuario fue desactivado, le cambiaron la
 * contraseña o le revocaron las sesiones. Esa comprobación es la que antes no
 * existía y hacía imposible echar a nadie antes de que expirara su token.
 */
export const authMiddleware = async (req, res, next) => {
  const token = extraerToken(req);

  if (!token) {
    return res.status(401).json({ error: "Acceso denegado — token requerido" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }

  try {
    const usuario = await User.findByPk(decoded.id, CONSULTA_USUARIO);

    if (!usuario || !usuario.active) {
      return res.status(401).json({ error: "Sesión no válida" });
    }

    // Revocación: el token trae la versión que tenía la cuenta cuando se emitió.
    if ((decoded.tokenVersion ?? -1) !== usuario.tokenVersion) {
      return res.status(401).json({ error: "Sesión revocada. Inicie sesión de nuevo." });
    }

    req.token = token;

    // Los datos vienen de la base, no del token: aunque alguien lograra alterar
    // el contenido del JWT, el rol efectivo es el que está guardado.
    req.user = {
      id: usuario.id,
      name: usuario.name,
      email: usuario.email,
      roleId: usuario.roleId,
      role: usuario.role?.nombre ?? null,   // nombre, solo para auditoría y UI
    };

    next();
  } catch (error) {
    logger.error('[Auth] Error validando la sesión:', error);
    return res.status(500).json({ error: "Error al validar la sesión" });
  }
};

/**
 * Autorización por ID de rol.
 *
 * Antes se comparaba el *nombre* (`req.user.role !== 'admin'`), y ese nombre se
 * podía editar desde `PUT /api/v1/role/:id` sin necesidad de token. Renombrar
 * el rol `user` a `admin` ascendía a toda la plantilla. Comparar contra el ID
 * del catálogo cierra ese camino.
 */
export const requireRoles = (...idsPermitidos) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Acceso denegado — token requerido" });
  }

  if (!idsPermitidos.includes(req.user.roleId)) {
    return res.status(403).json({ error: "Acceso denegado — permisos insuficientes" });
  }

  next();
};

export const requireAdmin = requireRoles(ROLES.ADMIN);
