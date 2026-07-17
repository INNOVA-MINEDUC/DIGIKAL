'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('equipos', [
      {

        modelo_id: 1,
        numero_serie: 'SN-001-ABC',
        codigo_sicoin: 'SIC-001',
        valor: 4500,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {

        modelo_id: 2,
        numero_serie: 'SN-002-DEF',
        codigo_sicoin: 'SIC-002',
        valor: 5500,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {

        modelo_id: 3,
        numero_serie: 'SN-003-GHI',
        codigo_sicoin: 'SIC-003',
        valor: 4000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        modelo_id: 4,
        numero_serie: 'SN-004-JKL',
        codigo_sicoin: 'SIC-004',
        valor: 1200,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {

        modelo_id: 5,
        numero_serie: 'SN-005-MNO',
        codigo_sicoin: 'SIC-005',
        valor: 3000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('equipos', null, {});
  },
};