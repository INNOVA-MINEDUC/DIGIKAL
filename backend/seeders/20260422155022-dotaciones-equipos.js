'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('dotaciones_equipos', [
      {
        dotacion_id: 1,
        equipo_id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        dotacion_id: 1,
        equipo_id: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        dotacion_id: 2,
        equipo_id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        dotacion_id: 2,
        equipo_id: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        dotacion_id: 3,
        equipo_id: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('dotaciones_equipos', null, {});
  },
};