'use strict';

export default {
  async up(queryInterface, Sequelize) {
    // 1. Actualizar las filas existentes que están en NULL
    await queryInterface.bulkUpdate('roles', 
      { nombre: 'admin', descripcion: 'Administrador del sistema' }, 
      { id: 1 }
    );

    await queryInterface.bulkUpdate('roles', 
      { nombre: 'user', descripcion: 'Usuario general' }, 
      { id: 2 }
    );

    // 2. Ahora que ya no hay NULLs, podemos hacer las columnas requeridas (NOT NULL)
    await queryInterface.changeColumn('roles', 'nombre', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('roles', 'descripcion', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    // Revertir el tipo a permitir NULL
    await queryInterface.changeColumn('roles', 'nombre', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('roles', 'descripcion', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
};
