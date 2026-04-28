'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('modelo_equipos', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      tipo_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tipo_equipos',
          key: 'id',
        },
        onDelete: 'RESTRICT', // ⚠️ no borrar tipo si hay modelos
        onUpdate: 'CASCADE',
      },

      nombre_modelo: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      descripcion_tecnica: {
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
    }, {
      indexes: [
        {
          unique: true,
          fields: ['tipo_id', 'nombre_modelo', 'marca'], // 🔥 evita duplicados tipo/modelo
        },
      ],
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('modelo_equipos');
  },
};