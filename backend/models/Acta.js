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

  // Sin unique: una dotación puede tener varias actas.
  dotacion_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
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

  // Cada acta tiene su propio origen; `dotaciones.origen` guarda el de la
  // primera acta para que los filtros y reportes por dotación sigan andando.
  origen: {
    type: DataTypes.ENUM('DONACION', 'COMPRA'),
    allowNull: false,
    defaultValue: 'DONACION',
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