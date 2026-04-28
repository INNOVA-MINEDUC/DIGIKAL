'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('actas', {

      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      dotacion_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true, 
        references: {
          model: 'dotaciones',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },


      fecha_entrega: {
        type: Sequelize.DATEONLY,
      },


      acta_pdf: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('actas');
  },
};