'use strict';

/**
 * Reemplaza el "tipo de proyecto" por el ORIGEN de la dotación.
 *
 * Antes: dotaciones.id_proyecto → FK a la tabla `proyectos` (catálogo libre).
 * Ahora: dotaciones.origen → ENUM('DONACION', 'COMPRA').
 *
 * Al ser sólo dos valores fijos no se justifica una tabla aparte, así que la
 * tabla `proyectos` se elimina junto con su FK.
 *
 * OJO: las dotaciones que ya existían pierden el proyecto al que estaban
 * asociadas y quedan todas como 'DONACION' (el default). No hay forma de
 * derivar el origen desde el nombre del proyecto.
 */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('dotaciones', 'origen', {
      type: Sequelize.ENUM('DONACION', 'COMPRA'),
      allowNull: false,
      defaultValue: 'DONACION',
    });

    // MySQL no deja borrar una columna mientras tenga un FK vivo, y el nombre
    // del constraint lo generó el motor: hay que buscarlo antes de quitarlo.
    const [fks] = await queryInterface.sequelize.query(`
      SELECT CONSTRAINT_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'dotaciones'
        AND COLUMN_NAME = 'id_proyecto'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `);

    for (const fk of fks) {
      await queryInterface.removeConstraint('dotaciones', fk.CONSTRAINT_NAME);
    }

    await queryInterface.removeColumn('dotaciones', 'id_proyecto');
    await queryInterface.dropTable('proyectos');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.createTable('proyectos', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      nombre: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.STRING, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // Se necesita al menos una fila para que las dotaciones existentes puedan
    // apuntar a algo si alguien vuelve a poner el FK en NOT NULL.
    await queryInterface.bulkInsert('proyectos', [
      {
        nombre: 'PROVEDUC',
        description: 'Dotación de laptops y equipos a escuelas',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // allowNull: true a propósito — las dotaciones creadas mientras existía
    // `origen` no tienen proyecto y un NOT NULL haría fallar el rollback.
    await queryInterface.addColumn('dotaciones', 'id_proyecto', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'proyectos', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.removeColumn('dotaciones', 'origen');
  },
};
