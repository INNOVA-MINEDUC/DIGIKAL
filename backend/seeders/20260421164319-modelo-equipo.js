'use strict';

export default {
  async up(queryInterface, Sequelize) {

    return 

    await queryInterface.bulkInsert('modelo_equipos', [
      {
        tipo_id: 1, 
        nombre_modelo: 'Dell Inspiron 15',
        descripcion_tecnica: 'Intel i5, 8GB RAM, 512GB SSD',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tipo_id: 1,
        nombre_modelo: 'HP Pavilion 14',
        descripcion_tecnica: 'Intel i7, 16GB RAM, 512GB SSD',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tipo_id: 2, // Desktop
        nombre_modelo: 'Dell OptiPlex 7090',
        descripcion_tecnica: 'Intel i5, 8GB RAM, 1TB HDD',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tipo_id: 3, // Impresora
        nombre_modelo: 'HP LaserJet Pro M404',
        descripcion_tecnica: 'Impresión láser monocromática',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tipo_id: 4, // UPS
        nombre_modelo: 'APC Back-UPS 600VA',
        descripcion_tecnica: 'Protección eléctrica básica',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tipo_id: 5, // Tablet
        nombre_modelo: 'Samsung Galaxy Tab A8',
        descripcion_tecnica: 'Pantalla 10.5", 64GB',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tipo_id: 6, // Router
        nombre_modelo: 'TP-Link Archer C6',
        descripcion_tecnica: 'Router WiFi AC1200',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('modelo_equipos', null, {});
  },
};