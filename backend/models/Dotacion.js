import { DataTypes } from 'sequelize'
import sequelize from '../config/connection.js'

const Dotacion = sequelize.define('Dotacion', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  id_escuela: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  id_proyecto: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  fecha_entrega: {
    type: DataTypes.DATE,
  },

  descripcion: {
    type: DataTypes.STRING,
  },

}, {
  tableName: 'dotaciones',
  timestamps: true,
})



export default Dotacion