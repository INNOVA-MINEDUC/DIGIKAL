import { DataTypes } from 'sequelize'
import sequelize from '../config/connection.js'

const Beneficiario = sequelize.define('Beneficiario', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  escuela_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'escuelas',
      key: 'id',
    }
  },

  ciclo_educativo: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  // --- Conteos por Género y Rol ---
  hombres: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },

  mujeres: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },

  docentes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },

  // --- Conteos Étnicos ---
  mayas: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },

  xincas: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },

  garifunas: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },

  otros: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },

  // --- Rangos de Edad (Los que faltaban) ---
  edad_0_13: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },

  edad_13_30: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },

  edad_30_60: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },

  edad_mas_60: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },

}, {
  tableName: 'beneficiarios',
  timestamps: true, // Esto manejará automáticamente createdAt y updatedAt
})



export default Beneficiario