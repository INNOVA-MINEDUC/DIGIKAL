'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('dotaciones_equipos', {
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

      equipo_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'equipos',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },

      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },

      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // evitar duplicados
    await queryInterface.addConstraint('dotaciones_equipos', {
      fields: ['dotacion_id', 'equipo_id'],
      type: 'unique',
      name: 'unique_dotacion_equipo'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('dotaciones_equipos');
  },
};