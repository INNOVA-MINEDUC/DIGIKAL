'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // 1. ROLES
    await queryInterface.createTable('roles', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      nombre: { type: Sequelize.STRING, allowNull: false, unique: true },
      descripcion: { type: Sequelize.STRING, allowNull: false, unique: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    // 2. USERS (Tabla 'Users' según modelo)
    await queryInterface.createTable('Users', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password: { type: Sequelize.STRING, allowNull: false },
      roleId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'roles', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    // 3. DEPARTAMENTOS
    await queryInterface.createTable('departamentos', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      nombre: { type: Sequelize.STRING, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    // 4. MUNICIPIOS
    await queryInterface.createTable('municipios', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      nombre: { type: Sequelize.STRING, allowNull: false },
      departamentoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'departamentos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    // 5. ESCUELAS
    await queryInterface.createTable('escuelas', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      nombreEscuela: { type: Sequelize.STRING, allowNull: false },
      codigoEscuela: { type: Sequelize.STRING, allowNull: false, unique: true },
      departamentoId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'departamentos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      municipioId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'municipios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      direccion: { type: Sequelize.STRING, allowNull: true },
      telefono: { type: Sequelize.STRING, allowNull: true },
      correo: { type: Sequelize.STRING, allowNull: true },
      director: { type: Sequelize.STRING, allowNull: true },
      nivel: { type: Sequelize.STRING, allowNull: true },
      jornada: { type: Sequelize.STRING, allowNull: true },
      cantidadEquipoEntregado: { type: Sequelize.INTEGER, defaultValue: 0 },
      cantidadEstudiantesBeneficiados: { type: Sequelize.INTEGER, defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    // 6. PROYECTOS
    await queryInterface.createTable('proyectos', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      nombre: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.STRING, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    // 7. INTERNET
    await queryInterface.createTable('internet', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      empresa: { type: Sequelize.STRING, allowNull: true },
      fecha_instalacion: { type: Sequelize.DATEONLY, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    // 8. DOTACIONES
    await queryInterface.createTable('dotaciones', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      id_escuela: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'escuelas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_proyecto: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'proyectos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_internet: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'internet', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      fecha_entrega: { type: Sequelize.DATE },
      descripcion: { type: Sequelize.STRING },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    // 9. ACTAS
    await queryInterface.createTable('actas', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      no_acta: { type: Sequelize.STRING, allowNull: true },
      dotacion_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: 'dotaciones', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      fecha_entrega: { type: Sequelize.DATEONLY, allowNull: true },
      folios: { type: Sequelize.STRING, allowNull: true },
      correlativo: { type: Sequelize.STRING, allowNull: true },
      acta_pdf: { type: Sequelize.STRING, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    // 10. TIPO_EQUIPOS
    await queryInterface.createTable('tipo_equipos', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      nombre: { type: Sequelize.STRING, allowNull: false, unique: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    // 11. MODELO_EQUIPOS
    await queryInterface.createTable('modelo_equipos', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      tipo_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tipo_equipos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      nombre_modelo: { type: Sequelize.STRING, allowNull: false },
      descripcion_tecnica: { type: Sequelize.STRING },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    // 12. EQUIPOS
    await queryInterface.createTable('equipos', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      modelo_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'modelo_equipos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      numero_serie: { type: Sequelize.STRING, allowNull: false, unique: true },
      codigo_sicoin: { type: Sequelize.STRING, allowNull: false, unique: true },
      valor: { type: Sequelize.INTEGER },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    // 13. DOTACIONES_EQUIPOS
    await queryInterface.createTable('dotaciones_equipos', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      dotacion_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'dotaciones', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      equipo_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'equipos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    // 14. DOTACION_IMAGENES
    await queryInterface.createTable('dotacion_imagenes', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      dotacion_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'dotaciones', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      url: { type: Sequelize.STRING, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    // 15. BENEFICIARIOS
    await queryInterface.createTable('beneficiarios', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      escuela_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'escuelas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      ciclo_educativo: { type: Sequelize.STRING, allowNull: true },
      hombres: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      mujeres: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      docentes: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      mayas: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      xincas: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      garifunas: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      otros: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      edad_0_13: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      edad_13_30: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      edad_30_60: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      edad_mas_60: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
  },

  async down(queryInterface, Sequelize) {
    // Eliminar en orden inverso por las llaves foráneas
    await queryInterface.dropTable('beneficiarios');
    await queryInterface.dropTable('dotacion_imagenes');
    await queryInterface.dropTable('dotaciones_equipos');
    await queryInterface.dropTable('equipos');
    await queryInterface.dropTable('modelo_equipos');
    await queryInterface.dropTable('tipo_equipos');
    await queryInterface.dropTable('actas');
    await queryInterface.dropTable('dotaciones');
    await queryInterface.dropTable('internet');
    await queryInterface.dropTable('proyectos');
    await queryInterface.dropTable('escuelas');
    await queryInterface.dropTable('municipios');
    await queryInterface.dropTable('departamentos');
    await queryInterface.dropTable('Users');
    await queryInterface.dropTable('roles');
  }
};
