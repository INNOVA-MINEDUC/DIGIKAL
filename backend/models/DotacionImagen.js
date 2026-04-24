import { DataTypes } from 'sequelize'
import sequelize from '../config/connection.js'

const DotacionImagen = sequelize.define('DotacionImagen', {

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  dotacion_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },

}, {
  tableName: 'dotacion_imagenes',
  timestamps: true,
})



export default DotacionImagen