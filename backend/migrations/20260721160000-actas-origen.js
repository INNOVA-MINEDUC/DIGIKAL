'use strict';

/**
 * El origen pasa a registrarse por acta, no por dotación.
 *
 * Cada acta tiene su propia fecha de entrega (`actas.fecha_entrega`, que ya
 * existía) y ahora también su propio origen. `dotaciones.origen` se mantiene:
 * el backend lo rellena con el origen de la primera acta, porque los filtros
 * y reportes siguen consultándolo a nivel de dotación.
 *
 * Las actas que ya existían heredan el origen de su dotación.
 */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('actas', 'origen', {
      type: Sequelize.ENUM('DONACION', 'COMPRA'),
      allowNull: false,
      defaultValue: 'DONACION',
    });

    await queryInterface.sequelize.query(`
      UPDATE actas a
      JOIN dotaciones d ON d.id = a.dotacion_id
      SET a.origen = d.origen
    `);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('actas', 'origen');
  },
};
