export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('beneficiarios', {

      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      escuela_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'escuelas',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },

      ciclo_educativo: {
        type: Sequelize.STRING,
      },

      hombres: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      mujeres: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      docentes: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      total: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      maya: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      xinca: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      garifuna: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      ladina: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      otros: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
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
    await queryInterface.dropTable('beneficiarios');
  },
};