import { Sequelize } from 'sequelize';

/**
 * Conexión a la base del servicio de tablets (Ciudadanía Digital).
 *
 * Es una base SEPARADA de la de DIGIKAL y vive en otro servidor: la alimenta
 * el proceso que carga los archivos de las OPF (ver las tablas `archivos_*`,
 * `entregas` y `filas_descartadas`). Por eso tiene su propia conexión en vez
 * de reutilizar config/connection.js.
 *
 * REGLA: desde este backend la base es de SOLO LECTURA.
 *   - No hay modelos con sync(), ni migraciones, ni seeders que la toquen.
 *   - Las consultas se hacen con SQL directo (sequelize.query) porque varias
 *     tablas tienen clave primaria compuesta y lo que se necesita son
 *     agregados y uniones entre alumnos y docentes, no un ORM por fila.
 * Si algún día hay que escribir aquí, que sea con un usuario distinto y una
 * revisión aparte: este servicio solo consulta.
 */
const tabletsDb = new Sequelize(
  process.env.TABLETS_DB_NOMBRE,
  process.env.TABLETS_DB_USUARIO,
  process.env.TABLETS_DB_PASSWORD,
  {
    host: process.env.TABLETS_DB_HOST,
    port: Number(process.env.TABLETS_DB_PUERTO) || 3306,
    dialect: 'mysql',
    logging: false,
    pool: { max: 5, min: 0, acquire: 20000, idle: 10000 },
    dialectOptions: { connectTimeout: 15000 },
  }
);

/** ¿Están configuradas las credenciales? Si no, la vista sigue viva pero vacía. */
export const tabletsDbConfigurada = Boolean(
  process.env.TABLETS_DB_HOST && process.env.TABLETS_DB_NOMBRE && process.env.TABLETS_DB_USUARIO
);

export default tabletsDb;
