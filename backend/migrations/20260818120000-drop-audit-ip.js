'use strict';

/**
 * Elimina la columna `ipAddress` de la bitácora.
 *
 * La dirección IP es un dato personal: identifica al equipo y, con el registro
 * del proveedor, a la persona. Para auditar QUÉ hizo cada usuario ya está el
 * `userId` junto con su nombre y correo, así que la IP no aportaba nada a la
 * trazabilidad y sí ampliaba lo que hay que proteger.
 *
 * El `down` la recrea vacía: los valores anteriores no se conservan, que es
 * justamente el propósito de dejar de guardarlos.
 *
 * @type {import('sequelize-cli').Migration}
 */
export default {
  async up(queryInterface) {
    const tabla = await queryInterface.describeTable('audit_logs');
    if (tabla.ipAddress) {
      await queryInterface.removeColumn('audit_logs', 'ipAddress');
    }
  },

  async down(queryInterface, Sequelize) {
    const tabla = await queryInterface.describeTable('audit_logs');
    if (!tabla.ipAddress) {
      await queryInterface.addColumn('audit_logs', 'ipAddress', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },
};
