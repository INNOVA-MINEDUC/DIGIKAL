import { DataTypes } from 'sequelize'
import sequelize from '../config/connection.js'

const DotacionEquipo = sequelize.define('DotacionEquipo', {

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  dotacion_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  equipo_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

}, {
  tableName: 'dotaciones_equipos',
  timestamps: true,
});

export default DotacionEquipo;