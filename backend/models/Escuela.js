import { DataTypes } from 'sequelize'
import sequelize from '../config/connection.js'

const Escuela = sequelize.define('Escuela', {

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  nombreEscuela: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  codigoEscuela: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  departamentoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  municipioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  direccion: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  telefono: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  correo: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  director: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  cantidadEquipoEntregado: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },

  cantidadEstudiantesBeneficiados: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  }

}, {
  tableName: 'escuelas',
  timestamps: true,
})

Escuela.associate = (models) => {

 
  Escuela.belongsTo(models.Departamento, {
    foreignKey: 'departamentoId',
    as: 'departamento'
  })


  Escuela.belongsTo(models.Municipio, {
    foreignKey: 'municipioId',
    as: 'municipio'
  })


  Escuela.hasMany(models.EntregaDetalle, {
    foreignKey: 'escuelaId',
    as: 'entregas'
  })

}

export default Escuela