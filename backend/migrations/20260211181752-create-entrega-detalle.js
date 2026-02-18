export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('entrega_detalles', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      img: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      detalle: {
        type: Sequelize.STRING,
        allowNull: false,
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
    await queryInterface.dropTable('entrega_detalles')
  },
}
