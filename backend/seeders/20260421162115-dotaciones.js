'use strict';

export default {
  async up(queryInterface, Sequelize) {

    // 🔥 evita duplicados
    await queryInterface.bulkDelete('dotaciones', null, {});

    await queryInterface.bulkInsert('dotaciones', [
      {
        id_escuela: 1,
        id_proyecto: 1,
        fecha_entrega: new Date(),
        descripcion: 'Entrega inicial de equipos',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_escuela: 2,
        id_proyecto: 1,
        fecha_entrega: new Date(),
        descripcion: 'Segunda entrega de equipos',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_escuela: 3,
        id_proyecto: 2,
        fecha_entrega: new Date(),
        descripcion: 'Mejoramiento de infraestructura',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_escuela: 4,
        id_proyecto: 1,
        fecha_entrega: new Date(),
        descripcion: 'Capacitación tecnológica',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_escuela: 5,
        id_proyecto: 2,
        fecha_entrega: new Date(),
        descripcion: 'Instalación de internet',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('dotaciones', null, {});
  },
};