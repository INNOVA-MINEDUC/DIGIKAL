export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('actas', {

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

      no_acta: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      libro_folio: {
        type: Sequelize.STRING,
      },

      correlativo: {
        type: Sequelize.STRING,
      },

      fecha_entrega: {
        type: Sequelize.DATEONLY,
      },

      mes: {
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