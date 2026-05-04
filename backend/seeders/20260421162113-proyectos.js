'use strict';

export default {
  async up(queryInterface, Sequelize) {

    // 🔥 recomendado para evitar duplicados
    await queryInterface.bulkDelete('proyectos', null, {});

    await queryInterface.bulkInsert('proyectos', [
      {
        nombre: 'PROVEDUC',
        description: 'Dotación de laptops y equipos a escuelas',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: 'INNOVACIÖN',
        description: 'instalaciones de red y dotación de equipo',
        createdAt: new Date(),
        updatedAt: new Date(),
      },

    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('proyectos', null, {});
  },
};