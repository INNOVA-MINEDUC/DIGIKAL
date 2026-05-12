import Role from '../models/Role.js';

// 🔍 Obtener todos los roles
export const getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      order: [['id', 'ASC']]
    });

    res.json(roles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener roles' });
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
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el rol' });
  }
};

// ➕ Crear rol
export const createRole = async (req, res) => {
  try {
    const { name } = req.body;

    const newRole = await Role.create({ name });

    res.status(201).json(newRole);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el rol' });
  }
};

// ✏️ Actualizar rol
export const updateRole = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);

    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    await role.update(req.body);

    res.json(role);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el rol' });
  }
};

// ❌ Eliminar rol
export const deleteRole = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);

    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    await role.destroy();

    res.json({ message: 'Rol eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el rol' });
  }
};