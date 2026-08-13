import { DataTypes } from 'sequelize'
import sequelize from '../config/connection.js'

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  // 🔥 NUEVO CAMPO
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },

  /**
   * Se incrementa para invalidar de golpe todos los tokens ya emitidos a este
   * usuario (cambio de contraseña, desactivación, cierre de sesión forzado).
   * El JWT lleva una copia; si no coincide con esta columna, no vale.
   */
  tokenVersion: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },

  /** Intentos de login fallidos consecutivos; se limpia al entrar bien. */
  failedLoginAttempts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },

  /** Si es una fecha futura, la cuenta está bloqueada hasta ese momento. */
  lockedUntil: {
    type: DataTypes.DATE,
    allowNull: true,
  }

}, {
  tableName: 'Users', // ⚠️ importante: coincide con la migración
  timestamps: true,
})

export default User