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

Departamento.associate = (models) => {

  Departamento.hasMany(models.Municipio, {
    foreignKey: 'departamentoId',
    as: 'municipios'
  })

  Departamento.hasMany(models.Escuela, {
    foreignKey: 'departamentoId',
    as: 'escuelas'
  })

}

export default Departamento