import User from '../models/User.js';
import Role from '../models/Role.js';
import bcrypt from 'bcryptjs';
import { logAction } from '../services/auditService.js';
import { ROLES, BCRYPT_ROUNDS } from '../config/env.js';
import { errorServidor, errorValidacion } from '../utils/http.js';
import {
  validarPassword,
  validarRoleId,
  validarEmail,
  normalizarEmail,
} from '../utils/validaciones.js';

/**
 * Todas estas rutas exigen rol de administrador (ver user.routes.js). Antes
 * solo pedían un token válido, así que cualquier usuario autenticado podía
 * listar la plantilla completa, crearse cuentas, cambiar su propio `roleId` a 1
 * y ascender a administrador, o borrar al administrador real.
 */

const SIN_PASSWORD = { exclude: ['password'] };


// 🔍 GET TODOS LOS USUARIOS
export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: SIN_PASSWORD,
      include: { model: Role, as: 'role' }
    });

    return res.status(200).json(users);

  } catch (error) {
    return errorServidor(res, '[Users] getUsers', error, 'Error al obtener usuarios');
  }
};


// 🔍 GET USUARIO POR ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: SIN_PASSWORD,
      include: { model: Role, as: 'role' }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.status(200).json(user);

  } catch (error) {
    return errorServidor(res, '[Users] getUserById', error, 'Error al obtener usuario');
  }
};


// ➕ CREAR USUARIO
export const createUser = async (req, res) => {
  try {
    const { name, password, roleId } = req.body;
    const email = normalizarEmail(req.body.email);

    if (!name || !email || !password) {
      return errorValidacion(res, 'Nombre, email y contraseña son obligatorios');
    }

    const errEmail = validarEmail(email);
    if (errEmail) return errorValidacion(res, errEmail);

    const errPassword = validarPassword(password);
    if (errPassword) return errorValidacion(res, errPassword);

    // El rol se valida contra el catálogo: antes se guardaba lo que viniera.
    const errRol = validarRoleId(roleId);
    if (errRol) return errorValidacion(res, errRol);

    const existe = await User.findOne({ where: { email } });

    if (existe) {
      return errorValidacion(res, 'El correo ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      roleId: roleId ?? ROLES.USER,
    });

    await logAction(req, {
      action: 'USER_CREATED',
      module: 'USERS',
      resourceId: user.id,
      description: `Creó al usuario ${user.email} con roleId ${user.roleId ?? 'sin rol'}`,
    });

    return res.status(201).json({
      message: 'Usuario creado correctamente',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
      }
    });

  } catch (error) {
    return errorServidor(res, '[Users] createUser', error, 'Error al crear usuario');
  }
};


// ✏️ ACTUALIZAR USUARIO
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, password, roleId, active } = req.body;
    const email = req.body.email !== undefined ? normalizarEmail(req.body.email) : undefined;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const esSuPropiaCuenta = Number(id) === req.user.id;

    /* ── Salvaguardas ───────────────────────────────────────────────────── */

    // Un administrador no puede quitarse a sí mismo el acceso por descuido.
    if (esSuPropiaCuenta && active === false) {
      return errorValidacion(res, 'No puede desactivar su propia cuenta');
    }

    if (esSuPropiaCuenta && roleId !== undefined && Number(roleId) !== user.roleId) {
      return errorValidacion(res, 'No puede cambiar su propio rol');
    }

    // Y el sistema no puede quedarse sin ningún administrador activo.
    const pierdeAdmin =
      user.roleId === ROLES.ADMIN &&
      ((roleId !== undefined && Number(roleId) !== ROLES.ADMIN) || active === false);

    if (pierdeAdmin) {
      const otrosAdmins = await User.count({
        where: { roleId: ROLES.ADMIN, active: true },
      });
      if (otrosAdmins <= 1) {
        return errorValidacion(res, 'No se puede dejar el sistema sin administradores activos');
      }
    }

    /* ── Validaciones de los campos que llegan ──────────────────────────── */

    if (email !== undefined) {
      const errEmail = validarEmail(email);
      if (errEmail) return errorValidacion(res, errEmail);

      const ocupado = await User.findOne({ where: { email } });
      if (ocupado && ocupado.id !== user.id) {
        return errorValidacion(res, 'El correo ya está registrado');
      }
    }

    const errRol = validarRoleId(roleId);
    if (errRol) return errorValidacion(res, errRol);

    let hashedPassword = user.password;

    if (password) {
      const errPassword = validarPassword(password);
      if (errPassword) return errorValidacion(res, errPassword);
      hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    }

    /* ── Revocación de sesiones ─────────────────────────────────────────── */
    // Cambiar la contraseña, desactivar la cuenta o mover el rol tiene que
    // echar abajo las sesiones abiertas. Antes no: el token seguía sirviendo
    // hasta expirar, con los permisos que tenía cuando se emitió.
    const cambioSensible =
      Boolean(password) ||
      active === false ||
      (roleId !== undefined && Number(roleId) !== user.roleId);

    const datos = {
      password: hashedPassword,
      tokenVersion: cambioSensible ? user.tokenVersion + 1 : user.tokenVersion,
    };

    // Solo se tocan los campos que vinieron: antes se escribían siempre todos,
    // así que una petición sin `name` dejaba el nombre en null.
    if (name !== undefined) datos.name = name;
    if (email !== undefined) datos.email = email;
    if (roleId !== undefined) datos.roleId = roleId;
    if (active !== undefined) datos.active = active;

    // Al reactivar una cuenta se limpia cualquier bloqueo por intentos fallidos.
    if (active === true) {
      datos.failedLoginAttempts = 0;
      datos.lockedUntil = null;
    }

    await user.update(datos);

    await logAction(req, {
      action: 'USER_UPDATED',
      module: 'USERS',
      resourceId: user.id,
      description:
        `Actualizó al usuario ${user.email}` +
        (cambioSensible ? ' (se revocaron sus sesiones activas)' : ''),
    });

    const { password: _omitida, ...usuarioPublico } = user.toJSON();

    return res.status(200).json({
      message: 'Usuario actualizado correctamente',
      user: usuarioPublico
    });

  } catch (error) {
    return errorServidor(res, '[Users] updateUser', error, 'Error al actualizar usuario');
  }
};


// ❌ ELIMINAR USUARIO
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (Number(id) === req.user.id) {
      return errorValidacion(res, 'No puede eliminar su propia cuenta');
    }

    if (user.roleId === ROLES.ADMIN) {
      const admins = await User.count({ where: { roleId: ROLES.ADMIN, active: true } });
      if (admins <= 1) {
        return errorValidacion(res, 'No se puede eliminar al último administrador activo');
      }
    }

    const deletedEmail = user.email;

    await user.destroy();

    await logAction(req, {
      action: 'USER_DELETED',
      module: 'USERS',
      resourceId: id,
      description: `Eliminó al usuario ${deletedEmail}`,
    });

    return res.status(200).json({ message: 'Usuario eliminado correctamente' });

  } catch (error) {
    return errorServidor(res, '[Users] deleteUser', error, 'Error al eliminar usuario');
  }
};
