import { DataTypes } from 'sequelize'
import sequelize from '../config/connection.js'

/**
 * Registro del servicio "Ciudadanía Digital".
 *
 * Deliberadamente SIN relación a Escuela/Equipo/Dotacion — ver el comentario
 * de la migración 20260819100000-create-tablets-ciudadania. Es una tabla
 * independiente: estar aquí es lo que significa "pertenecer a Ciudadanía
 * Digital"; no estar, significa que esa tablet no es de este servicio.
 */
const TabletCiudadania = sequelize.define('TabletCiudadania', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  numeroSerie: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  codigoEstablecimiento: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nombreEstablecimiento: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  departamento: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  municipio: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  observaciones: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },

  registradoPorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  registradoPorNombre: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  registradoPorEmail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'tablets_ciudadania',
  timestamps: true,
  defaultScope: {
    // numeroSerieNorm es una columna generada por MySQL sólo para el índice
    // único (ver migración); no aporta nada a la API y no se declara arriba,
    // así que se excluye explícitamente para que un SELECT * no la arrastre.
    attributes: { exclude: ['numeroSerieNorm'] },
  },
})

export default TabletCiudadania
