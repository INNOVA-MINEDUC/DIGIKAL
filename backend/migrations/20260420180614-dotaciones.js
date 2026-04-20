'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('dotaciones', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      id_escuela: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'escuelas',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },

      id_proyecto: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'proyectos',
          key: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },

      fecha_entrega: {
        type: Sequelize.DATE,
      },

      descripcion: {
        type: Sequelize.STRING,
      },
      images: {
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
    await queryInterface.dropTable('dotaciones');
  },
};