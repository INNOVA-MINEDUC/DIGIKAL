import { DataTypes } from 'sequelize'
import sequelize from '../config/connection.js'

const Acta = sequelize.define('Acta', {

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  no_acta: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  dotacion_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },

  fecha_entrega: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },

  folios: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  correlativo: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  acta_pdf: {
    type: DataTypes.STRING,
    allowNull: true,
  },

}, {
  tableName: 'actas',
  timestamps: true,
})

Acta.associate = (models) => {

  Acta.belongsTo(models.Dotacion, {
    foreignKey: 'dotacion_id',
    as: 'dotacion'
  })

}

export default Acta