  'use strict';

  export default {
    async up(queryInterface, Sequelize) {
      await queryInterface.createTable('equipos', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },

        modelo_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'modelo_equipos',
            key: 'id',
          },
          onDelete: 'RESTRICT', 
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