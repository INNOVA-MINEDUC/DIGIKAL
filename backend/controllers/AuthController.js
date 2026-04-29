import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import User from "../models/User.js"
import Role from "../models/Role.js"
import dotenv from 'dotenv'
dotenv.config()

export const AuthLogin = async (req, res) => {
  try {
    const { email, password } = req.body


    // 1. Buscar usuario
    const user = await User.findOne({
      where: { email },
      include: {
        model: Role,
        as: 'role'
      }
    })

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    // 2. Comparar contraseña
    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      console.log("invalid Password")
      return res.status(401).json({ message: 'Contraseña incorrecta' })
    }

    // 3. Crear token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role?.name
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    // 4. Respuesta
    return res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role?.name
      }
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

export const isAuthenticated = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.json({
      id: decoded.id,
      role: decoded.role
    });

  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};