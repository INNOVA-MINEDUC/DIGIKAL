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

  // Sustituye al antiguo id_proyecto (FK a `proyectos`, tabla eliminada).
  origen: {
    type: DataTypes.ENUM('DONACION', 'COMPRA'),
    allowNull: false,
    defaultValue: 'DONACION',
  },

  id_internet: {
    type: DataTypes.INTEGER,
    allowNull: true,
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