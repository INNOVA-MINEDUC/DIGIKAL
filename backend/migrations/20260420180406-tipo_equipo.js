'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tipo_equipos', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      nombre: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true, // 🔥 evita duplicados tipo "Laptop"
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tipo_equipos');
  },
};