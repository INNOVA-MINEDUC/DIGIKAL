import Role from '../models/Role.js';
import User from '../models/User.js';
import { logAction } from '../services/auditService.js';
import { ROLES } from '../config/env.js';
import { errorServidor, errorValidacion } from '../utils/http.js';

/**
 * El catálogo de roles solo lo toca un administrador (ver roles.routes.js).
 *
 * Antes estas rutas no tenían ningún middleware y `updateRole` hacía
 * `role.update(req.body)` —asignación masiva sin filtrar campos—. Bastaba un
 * `PUT /api/v1/role/2 {"nombre":"admin"}` sin token para renombrar el rol
 * `user`: como el permiso se decidía por el nombre del rol, en el siguiente
 * inicio de sesión toda la plantilla recibía un token de administrador.
 */

/** Los tres roles del seeder sostienen la lógica de permisos: no se tocan. */
const ROLES_DEL_SISTEMA = new Set(Object.values(ROLES));

// 🔍 Obtener todos los roles
export const getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({ order: [['id', 'ASC']] });
    res.json(roles);
  } catch (error) {
    return errorServidor(res, '[Roles] getRoles', error, 'Error al obtener roles');
  }
};

// 🔍 Obtener un rol por ID
export const getRoleById = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);

    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    res.json(role);
  } catch (error) {
    return errorServidor(res, '[Roles] getRoleById', error, 'Error al obtener el rol');
  }
};

// ➕ Crear rol
export const createRole = async (req, res) => {
  try {
    // El modelo declara `nombre` y `descripcion`; el controlador anterior leía
    // `name`, que no existe, y por eso creaba filas inválidas.
    const nombre = String(req.body?.nombre ?? '').trim();
    const descripcion = String(req.body?.descripcion ?? '').trim();

    if (!nombre || !descripcion) {
      return errorValidacion(res, 'Nombre y descripción del rol son obligatorios');
    }

    const existe = await Role.findOne({ where: { nombre } });
    if (existe) {
      return errorValidacion(res, 'Ya existe un rol con ese nombre');
    }

    const newRole = await Role.create({ nombre, descripcion });

    await logAction(req, {
      action: 'ROLE_CREATED',
      module: 'ROLES',
      resourceId: newRole.id,
      description: `Creó el rol "${nombre}"`,
    });

    res.status(201).json(newRole);
  } catch (error) {
    return errorServidor(res, '[Roles] createRole', error, 'Error al crear el rol');
  }
};

// ✏️ Actualizar rol
export const updateRole = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);

    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    if (ROLES_DEL_SISTEMA.has(role.id)) {
      return errorValidacion(
        res,
        'Los roles del sistema (admin, user, auditor) no se pueden modificar',
        403
      );
    }

    // Lista blanca de campos. Nunca `req.body` entero: eso permitía escribir
    // cualquier columna del modelo, incluido el id.
    const datos = {};
    if (req.body?.nombre !== undefined) datos.nombre = String(req.body.nombre).trim();
    if (req.body?.descripcion !== undefined) datos.descripcion = String(req.body.descripcion).trim();

    if (!Object.keys(datos).length) {
      return errorValidacion(res, 'No hay campos válidos para actualizar');
    }

    await role.update(datos);

    await logAction(req, {
      action: 'ROLE_UPDATED',
      module: 'ROLES',
      resourceId: role.id,
      description: `Actualizó el rol "${role.nombre}"`,
    });

    res.json(role);
  } catch (error) {
    return errorServidor(res, '[Roles] updateRole', error, 'Error al actualizar el rol');
  }
};

// ❌ Eliminar rol
export const deleteRole = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);

    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    if (ROLES_DEL_SISTEMA.has(role.id)) {
      return errorValidacion(
        res,
        'Los roles del sistema (admin, user, auditor) no se pueden eliminar',
        403
      );
    }

    // Borrar un rol en uso dejaría usuarios apuntando a un rol inexistente.
    const enUso = await User.count({ where: { roleId: role.id } });
    if (enUso > 0) {
      return errorValidacion(res, `El rol tiene ${enUso} usuario(s) asignado(s)`);
    }

    const nombre = role.nombre;
    await role.destroy();

    await logAction(req, {
      action: 'ROLE_DELETED',
      module: 'ROLES',
      resourceId: req.params.id,
      description: `Eliminó el rol "${nombre}"`,
    });

    res.json({ message: 'Rol eliminado correctamente' });
  } catch (error) {
    return errorServidor(res, '[Roles] deleteRole', error, 'Error al eliminar el rol');
  }
};
