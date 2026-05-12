'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('roles', [
      {
        id: 1,
        nombre: 'admin',
        descripcion: 'Administrador del sistema',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        nombre: 'user',
        descripcion: 'Usuario general',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        nombre: 'auditor',
        descripcion: 'Auditor interno',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {});
  }
};