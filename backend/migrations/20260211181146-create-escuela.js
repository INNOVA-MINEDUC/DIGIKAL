export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('escuelas', {

      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      nombreEscuela: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      codigoEscuela: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },

      departamentoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'departamentos',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },

      municipioId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'municipios',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },

      direccion: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      telefono: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      correo: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      director: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      cantidadEquipoEntregado: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      cantidadEstudiantesBeneficiados: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },

    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('escuelas');
  },
};