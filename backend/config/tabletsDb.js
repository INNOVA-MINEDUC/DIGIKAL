import { Sequelize } from 'sequelize';
import { TABLETS_DB } from './env.js';

/**
 * Conexión a la base del servicio de tablets (Ciudadanía Digikal).
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
 *
 * La configuración viene de config/env.js (nunca de process.env directo), que
 * ya validó que estén las cuatro variables o ninguna.
 */
const tabletsDb = new Sequelize(
  TABLETS_DB.nombre,
  TABLETS_DB.usuario,
  TABLETS_DB.password,
  {
    host: TABLETS_DB.host,
    port: TABLETS_DB.puerto,
    dialect: 'mysql',
    logging: false,
    pool: { max: 5, min: 0, acquire: 20000, idle: 10000 },
    dialectOptions: { connectTimeout: 15000 },
  }
);

/** ¿Están configuradas las credenciales? Si no, la vista sigue viva pero vacía. */
export const tabletsDbConfigurada = TABLETS_DB.configurada;

/**
 * Comprobación al arrancar. NO tumba el servidor: el resto de la API no
 * depende de esta base. Sirve para que, si el servicio de tablets no responde
 * en un despliegue, se vea en el log del arranque y no cuando un usuario se
 * encuentre la vista vacía.
 *
 * Los dos fallos que cubre son justo los que no se ven desde el código:
 * que falten las variables en el servidor (el .env no viaja en la imagen,
 * ver .dockerignore) y que el servidor no alcance por red al host de la base.
 */
export const comprobarTabletsDb = async () => {
  if (!TABLETS_DB.configurada) {
    console.warn(
      '⚠️  Servicio de tablets DESACTIVADO: faltan las variables TABLETS_DB_* ' +
      '(ver backend/.env.example). Las rutas /api/v1/ciudadania responderán 503.'
    );
    return false;
  }

  try {
    await tabletsDb.authenticate();
    console.log(`✅ Conectado a la base de tablets (${TABLETS_DB.nombre}@${TABLETS_DB.host})`);
    return true;
  } catch (error) {
    console.error(
      `❌ No se pudo conectar a la base de tablets (${TABLETS_DB.nombre}@${TABLETS_DB.host}:${TABLETS_DB.puerto}): ` +
      `${error.original?.code || error.message}. ` +
      'Revise credenciales y que el servidor tenga salida hacia ese host. ' +
      'Las rutas /api/v1/ciudadania fallarán hasta que se resuelva.'
    );
    return false;
  }
};

export default tabletsDb;
