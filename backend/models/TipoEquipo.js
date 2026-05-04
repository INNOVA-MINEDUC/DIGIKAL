import { DataTypes } from 'sequelize'
import sequelize from '../config/connection.js'

const TipoEquipo = sequelize.define('TipoEquipo', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  }
}, {
  tableName: 'tipo_equipos',
  timestamps: true,
})


export default TipoEquipo