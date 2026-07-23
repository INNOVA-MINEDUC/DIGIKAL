'use strict';

/**
 * Permite varias actas por dotación.
 *
 * `actas.dotacion_id` estaba declarada UNIQUE, así que sólo cabía un acta por
 * dotación. Se quita ese índice único; la FK se mantiene.
 *
 * En MySQL no se puede borrar el índice único mientras la FK dependa de él
 * (es el único índice que cubre la columna), así que hay que soltar la FK,
 * borrar el índice y volver a crear la FK — al recrearla MySQL genera solo un
 * índice normal, no único.
 */

const nombresIndicesUnicos = async (queryInterface) => {
  const [filas] = await queryInterface.sequelize.query(`
    SELECT DISTINCT INDEX_NAME
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'actas'
      AND COLUMN_NAME = 'dotacion_id'
      AND NON_UNIQUE = 0
  `);
  return filas.map((f) => f.INDEX_NAME);
};

const nombresFks = async (queryInterface) => {
  const [filas] = await queryInterface.sequelize.query(`
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'actas'
      AND COLUMN_NAME = 'dotacion_id'
      AND REFERENCED_TABLE_NAME IS NOT NULL
  `);
  return filas.map((f) => f.CONSTRAINT_NAME);
};

const FK = {
  fields: ['dotacion_id'],
  type: 'foreign key',
  references: { table: 'dotaciones', field: 'id' },
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE',
};

export default {
  async up(queryInterface) {
    for (const fk of await nombresFks(queryInterface)) {
      await queryInterface.removeConstraint('actas', fk);
    }

    for (const idx of await nombresIndicesUnicos(queryInterface)) {
      await queryInterface.removeIndex('actas', idx);
    }

    await queryInterface.addConstraint('actas', {
      name: 'actas_dotacion_id_fk',
      ...FK,
    });
  },

  async down(queryInterface) {
    // Si ya hay dotaciones con más de un acta, volver a UNIQUE es imposible:
    // se avisa en vez de fallar con un error opaco de duplicados.
    const [[{ duplicadas }]] = await queryInterface.sequelize.query(`
      SELECT COUNT(*) AS duplicadas FROM (
        SELECT dotacion_id FROM actas GROUP BY dotacion_id HAVING COUNT(*) > 1
      ) AS t
    `);

    if (Number(duplicadas) > 0) {
      throw new Error(
        `No se puede revertir: hay ${duplicadas} dotación(es) con más de un acta. ` +
        'Hay que dejar una sola acta por dotación antes de revertir esta migración.'
      );
    }

    for (const fk of await nombresFks(queryInterface)) {
      await queryInterface.removeConstraint('actas', fk);
    }

    await queryInterface.addIndex('actas', ['dotacion_id'], {
      name: 'actas_dotacion_id_unique',
      unique: true,
    });

    await queryInterface.addConstraint('actas', {
      name: 'actas_dotacion_id_fk',
      ...FK,
    });
  },
};
