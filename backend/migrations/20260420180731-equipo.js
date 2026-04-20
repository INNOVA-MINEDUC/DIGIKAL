'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('equipos', {
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
        onDelete: 'CASCADE', // si borras dotación, borras equipos
        onUpdate: 'CASCADE',
      },

      modelo_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'modelo_equipos',
          key: 'id',
        },
        onDelete: 'RESTRICT', // ⚠️ no borrar modelo si hay equipos
        onUpdate: 'CASCADE',
      },

      numero_serie: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      codigo_sicoin: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      estado: {
        type: Sequelize.STRING, // activo, dañado, baja
      },

      valor: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable('equipos');
  },
};