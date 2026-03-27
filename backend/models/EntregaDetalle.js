import { DataTypes } from 'sequelize'
import sequelize from '../config/connection.js'

const EntregaDetalle = sequelize.define('EntregaDetalle', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  img: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  detalle: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  escuelaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

}, {
  tableName: 'entrega_detalles',
  timestamps: true,
})

EntregaDetalle.associate = (models) => {

  EntregaDetalle.belongsTo(models.Escuela, {
    foreignKey: 'escuelaId',
    as: 'escuela'
  })

}

export default EntregaDetalle