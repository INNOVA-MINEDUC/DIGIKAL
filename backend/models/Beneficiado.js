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
  },

  ciclo_educativo: {
    type: DataTypes.STRING,
  },

  hombres: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  mujeres: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  docentes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  total: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

}, {
  tableName: 'beneficiarios',
  timestamps: true,
})


export default Beneficiario