import 'dotenv/config';

/**
 * Validación de la configuración al arrancar.
 *
 * Antes, los secretos tenían valores por defecto (`process.env.JWT_SECRET ||
 * "secret"`). Eso hacía que un despliegue sin .env arrancara igual, firmando
 * tokens con una palabra que cualquiera puede adivinar: el fallo era silencioso,
 * que es la peor forma de fallar. Aquí el proceso se niega a levantar si falta
 * algo esencial, y el error dice exactamente qué falta.
 *
 * Todo el backend debe leer los secretos desde este módulo, nunca desde
 * process.env directamente, para que la validación no se pueda saltar.
 */

const IS_PROD = process.env.NODE_ENV === 'production';

const errores = [];

const requerida = (nombre) => {
  const valor = (process.env[nombre] ?? '').trim();
  if (!valor) errores.push(`Falta la variable de entorno ${nombre}`);
  return valor;
};

const DB_NAME      = requerida('DB_NAME');
const DB_USER      = requerida('DB_USER');
const DB_PASSWORD  = requerida('DB_PASSWORD');
const FRONTEND_URL = requerida('FRONTEND_URL');
const JWT_SECRET   = requerida('JWT_SECRET');

// Valores que alguna vez estuvieron en el código como respaldo o que aparecen
// en cualquier diccionario de ataque. Si el .env trae uno de estos, es que
// nadie generó un secreto de verdad.
const SECRETOS_PROHIBIDOS = ['secret', 'secreto', 'changeme', 'password', '123456', 'jwt_secret'];

if (JWT_SECRET) {
  if (JWT_SECRET.length < 32) {
    errores.push(
      `JWT_SECRET debe tener al menos 32 caracteres (tiene ${JWT_SECRET.length}). ` +
      `Genere uno con: node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`
    );
  }
  if (SECRETOS_PROHIBIDOS.includes(JWT_SECRET.toLowerCase())) {
    errores.push('JWT_SECRET tiene un valor de ejemplo conocido. Genere uno aleatorio.');
  }
}

if (IS_PROD && ['root', 'admin', 'password', ''].includes(DB_PASSWORD.toLowerCase())) {
  errores.push('DB_PASSWORD es una contraseña por defecto y NODE_ENV=production.');
}

if (errores.length) {
  console.error('\n❌ Configuración inválida. El servidor no puede arrancar:\n');
  for (const e of errores) console.error(`   • ${e}`);
  console.error('\nRevise backend/.env (ver backend/.env.example).\n');
  process.exit(1);
}

/* ── Exports ─────────────────────────────────────────────────────────────── */

export { IS_PROD, JWT_SECRET, DB_NAME, DB_USER, DB_PASSWORD };

/**
 * Vigencia del token de acceso. Antes era '1d': una sesión robada servía 24
 * horas. Se acorta y se apoya en `tokenVersion` para poder revocarla antes.
 */
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

/**
 * Orígenes permitidos por CORS. Acepta varios separados por coma.
 * Antes se pasaba `process.env.FRONTEND_URL` directo: si la variable faltaba,
 * el paquete `cors` caía a `*` y aceptaba peticiones de cualquier sitio.
 */
export const ORIGENES_PERMITIDOS = FRONTEND_URL
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);

/**
 * Identificadores del catálogo `roles` (ver seeder demo-roles).
 *
 * El control de acceso se hace contra el ID, no contra el nombre. Antes se
 * comparaba `role !== 'admin'`, de modo que renombrar la fila del rol `user`
 * a `admin` —cosa que se podía hacer sin token— convertía a todos los usuarios
 * en administradores en su siguiente inicio de sesión.
 */
export const ROLES = Object.freeze({
  ADMIN: 1,
  USER: 2,
  AUDITOR: 3,
});

export const ROLES_VALIDOS = Object.freeze(Object.values(ROLES));

/**
 * Deja abiertas sin token las rutas de solo lectura que alimentan el mapa y el
 * tablero públicos del sitio (`/`, `/dashboard`, `/details` en el front).
 * Esas respuestas van filtradas: no incluyen series, códigos SICOIN ni valores
 * del inventario. Poner API_PUBLICA=false en el .env exige token para todo.
 */
export const API_PUBLICA = process.env.API_PUBLICA !== 'false';
