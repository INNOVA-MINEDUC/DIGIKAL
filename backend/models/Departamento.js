import { DataTypes } from 'sequelize'
import sequelize from '../config/connection.js'

const Departamento = sequelize.define('Departamento', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  tableName: 'departamentos',
  timestamps: true,
})


export default Departamento