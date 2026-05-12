import { DataTypes } from 'sequelize'
import sequelize from '../config/connection.js'

const Internet = sequelize.define('Internet', {

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  empresa: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  fecha_instalacion: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },

}, {
  tableName: 'internet',
  timestamps: true,
})

export default Internet