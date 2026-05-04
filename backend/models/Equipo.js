import { DataTypes } from 'sequelize'
import sequelize from '../config/connection.js'

const Equipo = sequelize.define('Equipo', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },


  modelo_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  numero_serie: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  codigo_sicoin: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  valor: {
    type: DataTypes.INTEGER,
  },

}, {
  tableName: 'equipos',
  timestamps: true,
})


export default Equipo