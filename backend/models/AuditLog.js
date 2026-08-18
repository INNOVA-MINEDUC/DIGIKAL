import { DataTypes } from 'sequelize'
import sequelize from '../config/connection.js'

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userEmail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  module: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  resourceId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'SUCCESS',
  },
  // La IP se dejó de guardar: es un dato personal y para saber quién hizo qué
  // ya están userId, userName y userEmail. Ver la migración drop-audit-ip.
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'audit_logs',
  timestamps: true,
  updatedAt: false,
})

export default AuditLog
