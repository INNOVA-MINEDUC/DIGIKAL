import { DataTypes } from 'sequelize'
import sequelize from '../config/connection.js'

const Acta = sequelize.define('Acta', {

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  dotacion_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },

  fecha_entrega: {
    type: DataTypes.DATEONLY,
  },

  acta_pdf: {
    type: DataTypes.STRING,
  },

}, {
  tableName: 'actas',
  timestamps: true,
})



export default Acta