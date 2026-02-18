'use strict';

export default {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('fase_politicas', [
      {
        name: 'Dotación de Equipo',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Infraestructura Escolar',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('fase_politicas', null, {});
  }
};
