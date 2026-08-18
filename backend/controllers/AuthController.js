import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import User from "../models/User.js"
import Role from "../models/Role.js"
import { JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_ROUNDS } from '../config/env.js'
import { logAction } from "../services/auditService.js"
import logger from '../utils/logger.js';

/* ── Bloqueo por cuenta ───────────────────────────────────────────────────
   El limitador de express-rate-limit cuenta por IP, y eso no basta: una
   botnet cambia de dirección en cada intento, pero la cuenta atacada es
   siempre la misma. Este contador vive en la fila del usuario.              */

const MAX_INTENTOS = 5;
const BLOQUEO_MINUTOS = 15;

/**
 * Hash de descarte para gastar el mismo tiempo cuando el correo no existe.
 * Sin esto, la respuesta llega mucho más rápido para un correo no registrado
 * que para uno real, y esa diferencia de milisegundos permite averiguar qué
 * cuentas existen aunque el mensaje de error sea idéntico.
 *
 * Se calcula al arrancar sobre un valor aleatorio, en lugar de ir escrito en
 * el código. Dos motivos: un hash bcrypt literal en el repositorio dispara los
 * analizadores de secretos (Semgrep `detected-bcrypt-hash`), y así el coste
 * coincide siempre con el de las contraseñas reales —que es justo lo que hace
 * que los tiempos se parezcan—. Nadie conoce la contraseña de origen, así que
 * ninguna comparación contra él puede dar verdadera.
 */
const HASH_SEÑUELO = bcrypt.hashSync(
  crypto.randomBytes(32).toString('hex'),
  BCRYPT_ROUNDS
);

// Mismo texto para «no existe» y «contraseña incorrecta». Antes devolvía 404 en
// un caso y 401 en el otro, lo que permitía enumerar los correos registrados.
const CREDENCIALES_INVALIDAS = { message: 'Credenciales incorrectas' };

const minutosRestantes = (fecha) =>
  Math.max(1, Math.ceil((new Date(fecha).getTime() - Date.now()) / 60000));

export const AuthLogin = async (req, res) => {
  try {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const password = String(req.body?.password ?? '');

    if (!email || !password) {
      return res.status(400).json({ message: 'Correo y contraseña son obligatorios' });
    }

    const user = await User.findOne({
      where: { email },
      include: { model: Role, as: 'role' }
    })

    if (!user) {
      await bcrypt.compare(password, HASH_SEÑUELO);   // iguala el tiempo de respuesta

      await logAction(req, {
        action: 'LOGIN_FAILED',
        module: 'AUTH',
        description: `Intento de inicio de sesión fallido para ${email} (usuario no encontrado)`,
        status: 'ERROR',
        userOverride: { email },
      })
      return res.status(401).json(CREDENCIALES_INVALIDAS)
    }

    // 1. ¿La cuenta está bloqueada por intentos fallidos?
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      await logAction(req, {
        action: 'LOGIN_BLOCKED',
        module: 'AUTH',
        description: `Intento sobre cuenta bloqueada: ${user.email}`,
        status: 'ERROR',
        userOverride: { id: user.id, email: user.email, name: user.name },
      })
      return res.status(429).json({
        message: `Cuenta bloqueada temporalmente por intentos fallidos. Intente en ${minutosRestantes(user.lockedUntil)} minuto(s).`
      })
    }

    // 2. ¿La cuenta está activa?
    if (!user.active) {
      await logAction(req, {
        action: 'LOGIN_FAILED',
        module: 'AUTH',
        description: `Intento de inicio de sesión de usuario inactivo: ${email}`,
        status: 'ERROR',
        userOverride: { id: user.id, email: user.email, name: user.name },
      })
      return res.status(403).json({
        message: 'Usuario inactivo. Contacte al administrador.'
      })
    }

    // 3. Comparar contraseña
    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      const intentos = (user.failedLoginAttempts ?? 0) + 1;
      const bloquear = intentos >= MAX_INTENTOS;

      await user.update({
        failedLoginAttempts: bloquear ? 0 : intentos,
        lockedUntil: bloquear ? new Date(Date.now() + BLOQUEO_MINUTOS * 60000) : user.lockedUntil,
      });

      await logAction(req, {
        action: bloquear ? 'ACCOUNT_LOCKED' : 'LOGIN_FAILED',
        module: 'AUTH',
        description: bloquear
          ? `Cuenta bloqueada ${BLOQUEO_MINUTOS} min tras ${MAX_INTENTOS} intentos fallidos: ${user.email}`
          : `Intento de inicio de sesión fallido para ${email} (contraseña incorrecta, ${intentos}/${MAX_INTENTOS})`,
        status: 'ERROR',
        userOverride: { id: user.id, email: user.email, name: user.name },
      })

      return res.status(401).json(CREDENCIALES_INVALIDAS)
    }

    // 4. Entrada correcta: se limpia el contador de fallos
    if (user.failedLoginAttempts !== 0 || user.lockedUntil) {
      await user.update({ failedLoginAttempts: 0, lockedUntil: null });
    }

    // 5. Crear token
    //    `roleId` es lo que manda para los permisos; `role` (el nombre) viaja
    //    solo para la interfaz. Antes el permiso se decidía por el nombre, que
    //    era editable desde la API sin autenticación.
    //    `tokenVersion` permite invalidar esta sesión antes de que expire.
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
        role: user.role?.nombre,
        tokenVersion: user.tokenVersion,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    await logAction(req, {
      action: 'LOGIN_SUCCESS',
      module: 'AUTH',
      description: `Inicio de sesión exitoso: ${user.email}`,
      userOverride: { id: user.id, email: user.email, name: user.name },
    })

    return res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
        role: user.role?.nombre
      }
    })

  } catch (error) {
    logger.error('[Auth] Error en el inicio de sesión:', error)
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

/**
 * Estado de la sesión. La ruta ya pasó por `authMiddleware`, que verificó la
 * firma, que el usuario siga activo y que la versión del token coincida con la
 * base: si llegamos aquí, la sesión es válida de verdad. Antes esta función
 * solo comprobaba la firma, así que un usuario desactivado seguía pasando.
 */
export const isAuthenticated = async (req, res) => {
  return res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    roleId: req.user.roleId,
    role: req.user.role,
  });
};

/**
 * Cierre de sesión del lado del servidor: sube `tokenVersion`, con lo que todos
 * los tokens emitidos a esta cuenta dejan de valer al instante (incluido uno
 * que alguien hubiera copiado). El front debe borrar el token igualmente.
 */
export const logout = async (req, res) => {
  try {
    await User.increment('tokenVersion', { where: { id: req.user.id } });

    await logAction(req, {
      action: 'LOGOUT',
      module: 'AUTH',
      description: `Cierre de sesión: ${req.user.email}`,
    });

    return res.json({ message: 'Sesión cerrada' });
  } catch (error) {
    logger.error('[Auth] Error al cerrar sesión:', error);
    return res.status(500).json({ message: 'Error al cerrar la sesión' });
  }
};
