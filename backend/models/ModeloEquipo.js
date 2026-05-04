import { DataTypes } from 'sequelize'
import sequelize from '../config/connection.js'

const ModeloEquipo = sequelize.define('ModeloEquipo', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  tipo_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  nombre_modelo: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  descripcion_tecnica: {
    type: DataTypes.STRING,
  },

}, {
  tableName: 'modelo_equipos',
  timestamps: true,
})



export default ModeloEquipo