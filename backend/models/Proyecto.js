import { DataTypes } from 'sequelize'
import sequelize from '../config/connection.js'

const Proyecto = sequelize.define('Proyecto', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },

  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },

  description: {
    type: DataTypes.STRING,
    allowNull: false
  },

}, {
  tableName: 'proyectos',
  timestamps: true,
})


export default Proyecto