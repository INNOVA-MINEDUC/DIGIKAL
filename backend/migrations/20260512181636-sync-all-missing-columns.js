'use strict'

/**
 * Migración de sincronización completa.
 *
 * Verifica y agrega TODAS las columnas que podrían faltar en la base de datos
 * de producción/desarrollo. Usa describeTable() para ser 100% segura:
 * si la columna ya existe, la omite.
 */
export default {
  async up(queryInterface, Sequelize) {

    // ── Helper: agregar columna solo si no existe ──
    async function addColumnIfMissing(table, column, definition) {
      const desc = await queryInterface.describeTable(table)
      if (!desc[column]) {
        await queryInterface.addColumn(table, column, definition)
        console.log(`✅ [${table}] columna '${column}' agregada`)
      } else {
        console.log(`⏭️  [${table}] columna '${column}' ya existe`)
      }
    }

    // ──────────────────────────────────────────────
    // 1. ROLES — nombre y descripcion
    // ──────────────────────────────────────────────
    await addColumnIfMissing('roles', 'nombre', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      defaultValue: '',
    })

    await addColumnIfMissing('roles', 'descripcion', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      defaultValue: '',
    })

    // ──────────────────────────────────────────────
    // 2. USERS — active
    // ──────────────────────────────────────────────
    await addColumnIfMissing('Users', 'active', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    })

    // ──────────────────────────────────────────────
    // 3. BENEFICIARIOS — campos étnicos y de edad
    // ──────────────────────────────────────────────
    const beneficiariosColumns = {
      mayas:      { type: Sequelize.INTEGER, defaultValue: 0 },
      xincas:     { type: Sequelize.INTEGER, defaultValue: 0 },
      garifunas:  { type: Sequelize.INTEGER, defaultValue: 0 },
      otros:      { type: Sequelize.INTEGER, defaultValue: 0 },
      edad_0_13:  { type: Sequelize.INTEGER, defaultValue: 0 },
      edad_13_30: { type: Sequelize.INTEGER, defaultValue: 0 },
      edad_30_60: { type: Sequelize.INTEGER, defaultValue: 0 },
      edad_mas_60:{ type: Sequelize.INTEGER, defaultValue: 0 },
    }

    for (const [col, def] of Object.entries(beneficiariosColumns)) {
      await addColumnIfMissing('beneficiarios', col, def)
    }

    // ──────────────────────────────────────────────
    // 4. DOTACIONES — id_internet (FK → internet)
    // ──────────────────────────────────────────────
    await addColumnIfMissing('dotaciones', 'id_internet', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'internet',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    })

    // ──────────────────────────────────────────────
    // 5. ESCUELAS — campos que podrían faltar
    // ──────────────────────────────────────────────
    await addColumnIfMissing('escuelas', 'cantidadEquipoEntregado', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
    })

    await addColumnIfMissing('escuelas', 'cantidadEstudiantesBeneficiados', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
    })

    console.log('\n🎉 Sincronización completada.\n')
  },

  async down(queryInterface) {
    // Roles
    await queryInterface.removeColumn('roles', 'nombre')
    await queryInterface.removeColumn('roles', 'descripcion')

    // Users
    await queryInterface.removeColumn('Users', 'active')

    // Beneficiarios
    const benCols = ['mayas', 'xincas', 'garifunas', 'otros', 'edad_0_13', 'edad_13_30', 'edad_30_60', 'edad_mas_60']
    for (const col of benCols) {
      await queryInterface.removeColumn('beneficiarios', col)
    }

    // Dotaciones
    await queryInterface.removeColumn('dotaciones', 'id_internet')

    // Escuelas
    await queryInterface.removeColumn('escuelas', 'cantidadEquipoEntregado')
    await queryInterface.removeColumn('escuelas', 'cantidadEstudiantesBeneficiados')
  }
}
