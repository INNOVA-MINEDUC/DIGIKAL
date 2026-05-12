export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('dotaciones', 'id_internet', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'internet',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('dotaciones', 'id_internet');
  }
}