'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('escuela_proyecto', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      escuelaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'escuelas',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },

      proyectoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'proyectos',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },

      // opcional (MUY útil)
      fechaAsignacion: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable('escuela_proyecto');
  },
};