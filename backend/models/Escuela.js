import { DataTypes } from 'sequelize'
import sequelize from '../config/connection.js'

const Escuela = sequelize.define('Escuela', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  codeUdi: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  fasePoliticaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'escuelas',
  timestamps: true,
})

export default Escuela
