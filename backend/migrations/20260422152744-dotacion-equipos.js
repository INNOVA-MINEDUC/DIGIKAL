'use strict';

export default {
  async up(queryInterface, Sequelize) {
    try {
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
    } catch (error) {
      if (error.name === 'SequelizeDatabaseError' && error.message.includes('already exists')) {
        console.log('⏭️  La tabla dotaciones_equipos ya existe, saltando createTable...');
      } else {
        throw error;
      }
    }

    // evitar duplicados (envuelto en try-catch por si ya existe el índice)
    try {
      await queryInterface.addConstraint('dotaciones_equipos', {
        fields: ['dotacion_id', 'equipo_id'],
        type: 'unique',
        name: 'unique_dotacion_equipo'
      });
    } catch (error) {
      if (error.name === 'SequelizeDatabaseError' && error.message.includes('Duplicate key')) {
        console.log('⏭️  El índice unique_dotacion_equipo ya existe, saltando...');
      } else {
        throw error;
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('dotaciones_equipos');
  },
};