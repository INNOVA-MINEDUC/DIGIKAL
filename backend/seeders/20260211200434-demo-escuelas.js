'use strict';

export default {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('escuelas', [
      {
        codeUdi: 'UDI-001',
        fasePoliticaId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        codeUdi: 'UDI-002',
        fasePoliticaId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        codeUdi: 'UDI-003',
        fasePoliticaId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('escuelas', null, {});
  }
};
