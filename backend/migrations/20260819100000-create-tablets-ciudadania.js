'use strict';

/**
 * Tabla del servicio "Ciudadanía Digital" — independiente del resto del
 * sistema por decisión explícita: estas tablets no pasan por el catálogo de
 * equipos (equipos/modelo_equipos/tipo_equipos) ni por el flujo de dotaciones.
 * Es un registro propio, sin llaves foráneas hacia esas tablas.
 *
 * El establecimiento se guarda DESNORMALIZADO (código, nombre, departamento,
 * municipio) en lugar de enlazarlo a `escuelas`, por dos motivos:
 *   1. La tabla `escuelas` local sólo tiene fila para los centros que ya
 *      registraron una dotación DIGIKAL — la inmensa mayoría de los ~11 500
 *      establecimientos del país no existen ahí. Exigir esa fila mezclaría
 *      este servicio nuevo con el flujo de dotaciones.
 *   2. Así el registro de una tablet no depende de que el API del MINEDUC
 *      esté disponible en el momento de la consulta.
 *
 * `registradoPorNombre/Email` sigue el mismo patrón denormalizado de
 * `audit_logs`: queda constancia de quién lo cargó sin depender de un JOIN
 * contra `Users` para poder mostrarlo.
 *
 * @type {import('sequelize-cli').Migration}
 */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tablets_ciudadania', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      // Se guarda tal cual se capturó (sin normalizar espacios/mayúsculas) para
      // no alterar lo que el usuario escribió; las búsquedas comparan
      // normalizado en la capa de aplicación.
      numeroSerie: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      codigoEstablecimiento: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      nombreEstablecimiento: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      departamento: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      municipio: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      observaciones: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },

      registradoPorId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      registradoPorNombre: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      registradoPorEmail: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // Único: la misma tablet no puede registrarse dos veces. La comparación de
    // negocio es insensible a mayúsculas (ver helpers/ciudadaniaNormalizar.js),
    // así que aquí se indexa una columna generada en minúsculas para que el
    // propio motor impida el duplicado aunque alguien lo intente fuera de la API.
    await queryInterface.sequelize.query(`
      ALTER TABLE tablets_ciudadania
      ADD COLUMN numeroSerieNorm VARCHAR(255)
        GENERATED ALWAYS AS (LOWER(TRIM(numeroSerie))) STORED,
      ADD UNIQUE INDEX uq_tablets_ciudadania_serie (numeroSerieNorm)
    `);

    await queryInterface.addIndex('tablets_ciudadania', ['departamento'], {
      name: 'idx_tablets_ciudadania_departamento',
    });
    await queryInterface.addIndex('tablets_ciudadania', ['codigoEstablecimiento'], {
      name: 'idx_tablets_ciudadania_codigo_establecimiento',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tablets_ciudadania');
  },
};
