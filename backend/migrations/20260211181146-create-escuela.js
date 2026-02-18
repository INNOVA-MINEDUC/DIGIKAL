export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('escuelas', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      codeUdi: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
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
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('escuelas')
  },
}
