'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('tipo_equipos', [
      {
        nombre: 'Laptop',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: 'Desktop',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: 'Impresora',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: 'UPS',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: 'Tablet',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: 'Router',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tipo_equipos', null, {});
  },
};