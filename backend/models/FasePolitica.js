import { DataTypes } from 'sequelize'
import sequelize from '../config/connection.js'

const FasePolitica = sequelize.define('FasePolitica', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
}, {
  tableName: 'fase_politicas',
  timestamps: true,
})

export default FasePolitica
