'use strict'

export default {
  async up(queryInterface, Sequelize) {
    // Verificar qué columnas ya existen para evitar errores
    const tableDescription = await queryInterface.describeTable('beneficiarios')

    const columnsToAdd = {
      mayas: { type: Sequelize.INTEGER, defaultValue: 0 },
      xincas: { type: Sequelize.INTEGER, defaultValue: 0 },
      garifunas: { type: Sequelize.INTEGER, defaultValue: 0 },
      otros: { type: Sequelize.INTEGER, defaultValue: 0 },
      edad_0_13: { type: Sequelize.INTEGER, defaultValue: 0 },
      edad_13_30: { type: Sequelize.INTEGER, defaultValue: 0 },
      edad_30_60: { type: Sequelize.INTEGER, defaultValue: 0 },
      edad_mas_60: { type: Sequelize.INTEGER, defaultValue: 0 },
    }

    for (const [columnName, columnDef] of Object.entries(columnsToAdd)) {
      if (!tableDescription[columnName]) {
        await queryInterface.addColumn('beneficiarios', columnName, columnDef)
        console.log(`✅ Columna '${columnName}' agregada a beneficiarios`)
      } else {
        console.log(`⏭️  Columna '${columnName}' ya existe, se omite`)
      }
    }
  },

  async down(queryInterface) {
    const columns = ['mayas', 'xincas', 'garifunas', 'otros', 'edad_0_13', 'edad_13_30', 'edad_30_60', 'edad_mas_60']
    for (const col of columns) {
      await queryInterface.removeColumn('beneficiarios', col)
    }
  }
}
