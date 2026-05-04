import { DataTypes } from 'sequelize'
import sequelize from '../config/connection.js'

const Municipio = sequelize.define('Municipio', {

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  departamentoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }

}, {
  tableName: 'municipios',
  timestamps: true,
})


export default Municipio