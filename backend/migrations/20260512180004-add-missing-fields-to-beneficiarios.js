'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('beneficiarios', 'mayas', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });
    // Agrega aquí xincas, garifunas, etc., si también faltan
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('beneficiarios', 'mayas');
  }
};
