import sequelize from './connection.js'

import FasePolitica from '../models/FasePolitica.js'
import Escuela from './models/Escuela.js'
import EntregaDetalle from './models/EntregaDetalle.js'

/* RELACIONES */

// FasePolitica 1 → N Escuela
FasePolitica.hasMany(Escuela, { foreignKey: 'fasePoliticaId' })
Escuela.belongsTo(FasePolitica, { foreignKey: 'fasePoliticaId' })

// Escuela 1 → N EntregaDetalle
Escuela.hasMany(EntregaDetalle, { foreignKey: 'escuelaId' })
EntregaDetalle.belongsTo(Escuela, { foreignKey: 'escuelaId' })

async function main() {
  try {
    await sequelize.authenticate()
    console.log('Conectado 🚀')

    await sequelize.sync({ alter: true })
    console.log('Tablas creadas correctamente ✅')

  } catch (error) {
    console.error(error)
  }
}

main()
