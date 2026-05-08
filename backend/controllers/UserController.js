import User from '../models/User.js';
import Role from '../models/Role.js';
import bcrypt from 'bcryptjs';


// 🔍 GET TODOS LOS USUARIOS
export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: {
        model: Role,
        as: 'role'
      }
    });

    return res.status(200).json(users);

  } catch (error) {
    return res.status(500).json({
      message: 'Error al obtener usuarios',
      error: error.message
    });
  }
};



// 🔍 GET USUARIO POR ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: {
        model: Role,
        as: 'role',
      }
    });

    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      });
    }

    return res.status(200).json(user);

  } catch (error) {
    return res.status(500).json({
      message: 'Error al obtener usuario',
      error: error.message
    });
  }
};



// ➕ CREAR USUARIO
export const createUser = async (req, res) => {
  try {
    const { name, email, password, roleId } = req.body;

    // Validaciones básicas
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Nombre, email y contraseña son obligatorios'
      });
    }

    // Verificar si ya existe
    const existe = await User.findOne({ where: { email } });

    if (existe) {
      return res.status(400).json({
        message: 'El correo ya está registrado'
      });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      roleId
    });

    return res.status(201).json({
      message: 'Usuario creado correctamente',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Error al crear usuario',
      error: error.message
    });
  }
};



// ✏️ ACTUALIZAR USUARIO
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, roleId, active  } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      });
    }

    // Si viene password → encriptar
    let hashedPassword = user.password;

    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    await user.update({
      name,
      email,
      password: hashedPassword,
      roleId,
      active
    });

    return res.status(200).json({
      message: 'Usuario actualizado correctamente',
      user
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Error al actualizar usuario',
      error: error.message
    });
  }
};



// ❌ ELIMINAR USUARIO
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      });
    }

    await user.destroy();

    return res.status(200).json({
      message: 'Usuario eliminado correctamente'
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Error al eliminar usuario',
      error: error.message
    });
  }
};