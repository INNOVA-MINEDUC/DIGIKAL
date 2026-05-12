export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("beneficiarios", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      escuela_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "escuelas",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },

      ciclo_educativo: {
        allowNull: true,
        type: Sequelize.STRING,
      },

      hombres: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      mujeres: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      docentes: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      mayas: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      xincas: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      garifunas: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      otros: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      edad_0_13: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      edad_13_30: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      edad_30_60: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      edad_mas_60: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("beneficiarios");
  },
};
