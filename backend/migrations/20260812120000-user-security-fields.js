'use strict';

/**
 * Campos de seguridad en Users:
 *
 *  - tokenVersion        → permite revocar sesiones. Va dentro del JWT; el
 *                          middleware lo compara con la base. Al cambiar la
 *                          contraseña o desactivar al usuario se incrementa y
 *                          todos sus tokens vigentes dejan de valer al instante.
 *                          Antes no había forma de cerrar una sesión robada:
 *                          el token servía hasta expirar solo.
 *  - failedLoginAttempts → contador de intentos fallidos consecutivos.
 *  - lockedUntil         → bloqueo temporal de la cuenta. El límite por IP no
 *                          basta: una botnet rota direcciones, pero la cuenta
 *                          atacada es siempre la misma.
 *
 * @type {import('sequelize-cli').Migration}
 */
export default {
  async up(queryInterface, Sequelize) {
    const tabla = await queryInterface.describeTable('Users');

    if (!tabla.tokenVersion) {
      await queryInterface.addColumn('Users', 'tokenVersion', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }

    if (!tabla.failedLoginAttempts) {
      await queryInterface.addColumn('Users', 'failedLoginAttempts', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }

    if (!tabla.lockedUntil) {
      await queryInterface.addColumn('Users', 'lockedUntil', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const tabla = await queryInterface.describeTable('Users');

    if (tabla.lockedUntil)         await queryInterface.removeColumn('Users', 'lockedUntil');
    if (tabla.failedLoginAttempts) await queryInterface.removeColumn('Users', 'failedLoginAttempts');
    if (tabla.tokenVersion)        await queryInterface.removeColumn('Users', 'tokenVersion');
  },
};
