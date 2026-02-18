'use strict';

export default {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('entrega_detalles', [
      {
        img: 'foto1.jpg',
        detalle: 'Entrega de computadoras',
        escuelaId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        img: 'foto2.jpg',
        detalle: 'Entrega de mobiliario',
        escuelaId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        img: 'foto3.jpg',
        detalle: 'Entrega de proyectores',
        escuelaId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('entrega_detalles', null, {});
  }
};
