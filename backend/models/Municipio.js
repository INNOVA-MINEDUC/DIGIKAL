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

Municipio.associate = (models) => {

  // 🔹 Municipio pertenece a un Departamento
  Municipio.belongsTo(models.Departamento, {
    foreignKey: 'departamentoId',
    as: 'departamento'
  })

  // 🔹 Municipio tiene muchas Escuelas
  Municipio.hasMany(models.Escuela, {
    foreignKey: 'municipioId',
    as: 'escuelas'
  })

}

export default Municipio