'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('dotacion_imagenes', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      dotacion_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'dotaciones',
          key: 'id',
        },
        onDelete: 'CASCADE', 
        onUpdate: 'CASCADE',
      },

      url: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      descripcion: {
        type: Sequelize.STRING,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('dotacion_imagenes');
  },
};