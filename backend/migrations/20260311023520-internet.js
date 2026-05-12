'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('internet', {

      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

        empresa: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      fecha_instalacion: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          'CURRENT_TIMESTAMP'
        ),
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          'CURRENT_TIMESTAMP'
        ),
      },

    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('internet');
  },
};