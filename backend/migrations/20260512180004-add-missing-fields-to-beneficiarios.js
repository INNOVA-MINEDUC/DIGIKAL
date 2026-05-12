'use strict'

export default {
  async up(queryInterface, Sequelize) {

    // ──────────────────────────────────────────────
    // 1. Columnas faltantes en tabla "beneficiarios"
    // ──────────────────────────────────────────────
    const beneficiariosDesc = await queryInterface.describeTable('beneficiarios')

    const beneficiariosColumns = {
      mayas: { type: Sequelize.INTEGER, defaultValue: 0 },
      xincas: { type: Sequelize.INTEGER, defaultValue: 0 },
      garifunas: { type: Sequelize.INTEGER, defaultValue: 0 },
      otros: { type: Sequelize.INTEGER, defaultValue: 0 },
      edad_0_13: { type: Sequelize.INTEGER, defaultValue: 0 },
      edad_13_30: { type: Sequelize.INTEGER, defaultValue: 0 },
      edad_30_60: { type: Sequelize.INTEGER, defaultValue: 0 },
      edad_mas_60: { type: Sequelize.INTEGER, defaultValue: 0 },
    }

    for (const [col, def] of Object.entries(beneficiariosColumns)) {
      if (!beneficiariosDesc[col]) {
        await queryInterface.addColumn('beneficiarios', col, def)
        console.log(`✅ Columna '${col}' agregada a beneficiarios`)
      } else {
        console.log(`⏭️  Columna '${col}' ya existe en beneficiarios, se omite`)
      }
    }

    // ──────────────────────────────────────────────
    // 2. Columna faltante en tabla "dotaciones"
    // ──────────────────────────────────────────────
    const dotacionesDesc = await queryInterface.describeTable('dotaciones')

    if (!dotacionesDesc['id_internet']) {
      await queryInterface.addColumn('dotaciones', 'id_internet', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'internet',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      })
      console.log(`✅ Columna 'id_internet' agregada a dotaciones`)
    } else {
      console.log(`⏭️  Columna 'id_internet' ya existe en dotaciones, se omite`)
    }
  },

  async down(queryInterface) {
    // Revertir beneficiarios
    const beneficiariosColumns = ['mayas', 'xincas', 'garifunas', 'otros', 'edad_0_13', 'edad_13_30', 'edad_30_60', 'edad_mas_60']
    for (const col of beneficiariosColumns) {
      await queryInterface.removeColumn('beneficiarios', col)
    }

    // Revertir dotaciones
    await queryInterface.removeColumn('dotaciones', 'id_internet')
  }
}
