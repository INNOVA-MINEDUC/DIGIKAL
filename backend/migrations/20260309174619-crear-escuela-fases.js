export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('escuela_fases', {

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
      },

      fasePoliticaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'fase_politicas',
          key: 'id',
        },
        onDelete: 'CASCADE',
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
    await queryInterface.dropTable('escuela_fases');
  },
};