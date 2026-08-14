// Debe ir primero: valida la configuración y aborta el arranque si falta un
// secreto. Antes el servidor levantaba igual y firmaba tokens con "secret".
import { ORIGENES_PERMITIDOS, IS_PROD } from './config/env.js';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';

import sequelize from './config/connection.js';
import { authMiddleware } from './middlewares/auth.middleware.js';

import escuelaRoutes from "./routes/escuela.routes.js";
import loginRoutes from './routes/auth.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import equipoRoutes from './routes/equipo.routes.js';
import tipoequipoRoutes from './routes/tipoequipo.routes.js';
import dotacionRoutes from './routes/dotacion.routes.js';
import userRoutes from './routes/user.routes.js';
import roleRoutes from './routes/roles.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import auditRoutes from './routes/audit.routes.js';
import estadisticasRoutes from './routes/estadisticas.routes.js';
import "./models/Relations.js";


const app = express();
app.set('trust proxy', 1); // Confiar en el proxy reverso (Nginx/Docker) para express-rate-limit
app.disable('x-powered-by');
const PORT = process.env.PORT;


/* ── Cabeceras de seguridad ───────────────────────────────────────────────
   Helmet pone nosniff, HSTS, X-Frame-Options y demás. No estaba puesto.
   `crossOriginResourcePolicy` se abre porque el front corre en otro puerto y
   necesita cargar las imágenes servidas desde /uploads.                     */
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));


/* ── CORS ─────────────────────────────────────────────────────────────────
   Antes era `origin: process.env.FRONTEND_URL`. Si esa variable faltaba, el
   paquete `cors` caía a `*` y aceptaba peticiones de cualquier sitio. Ahora la
   lista está validada al arrancar y se comprueba origen por origen.          */
app.use(cors({
  origin: (origin, callback) => {
    // Sin cabecera Origin: mismo origen, curl, Postman o apps móviles.
    if (!origin) return callback(null, true);

    const limpio = origin.replace(/\/+$/, '');
    if (ORIGENES_PERMITIDOS.includes(limpio)) return callback(null, true);

    return callback(new Error('Origen no permitido por CORS'));
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  maxAge: 600,
}));


// Tope de tamaño: sin él, express acepta cuerpos grandes y es fácil ahogar el
// proceso. Multer maneja el multipart aparte, con su propio límite.
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));


try {
  await sequelize.authenticate();
  console.log('✅ Conectado a la base de datos');
} catch (error) {
  console.error('❌ Error de conexión:', error);
}


/* ── Archivos subidos ─────────────────────────────────────────────────────
   Respaldo local de bucketService. Las cabeceras impiden que un archivo que
   lograra colarse con extensión .html o .svg se ejecute como página en el
   origen de la API: se descarga en vez de renderizarse, no se adivina el tipo
   y no puede cargar ningún recurso.                                          */
app.use('/uploads', express.static(path.resolve('uploads'), {
  index: false,
  dotfiles: 'deny',
  setHeaders: (res) => {
    res.setHeader('Content-Disposition', 'attachment');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
  },
}));


/* ═══════════════════════════════════════════════════════════════════════════
   ZONA PÚBLICA — accesible sin token
   ---------------------------------------------------------------------------
   Solo lo que alimenta el mapa y el tablero de la página de inicio, y siempre
   con datos agregados. NO AGREGAR NADA AQUÍ sin revisar qué expone: todo lo
   que se monte antes de la barrera de abajo queda abierto a internet.
   ═══════════════════════════════════════════════════════════════════════════ */

app.use('/api/v1/auth', loginRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);       // el detalle de escuela, dentro, sí pide token
app.use('/api/v1/estadisticas', estadisticasRoutes);


/* ═══════════════════════════════════════════════════════════════════════════
   BARRERA — de aquí para abajo todo exige sesión válida
   ---------------------------------------------------------------------------
   El modelo es "cerrado por defecto". Antes la autenticación se ponía ruta por
   ruta y se olvidó en archivos enteros (escuelas y roles quedaron abiertos:
   cualquiera podía borrar establecimientos sin tener cuenta).
   ═══════════════════════════════════════════════════════════════════════════ */

app.use('/api/v1', authMiddleware);

app.use('/api/v1/escuelas', escuelaRoutes);
app.use('/api/v1/equipos', equipoRoutes);
app.use('/api/v1/tipo_equipos', tipoequipoRoutes);
app.use('/api/v1/dotacion', dotacionRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/role', roleRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/audit', auditRoutes);


/* ── 404 y errores ────────────────────────────────────────────────────────
   Sin un manejador propio, Express muestra la traza del error en la respuesta
   cuando NODE_ENV no es production: eso revela rutas de archivos y estructura
   interna del servidor.                                                      */

app.use((req, res) => {
  res.status(404).json({ message: 'Recurso no encontrado' });
});

app.use((err, req, res, next) => {
  if (err?.message === 'Origen no permitido por CORS') {
    return res.status(403).json({ message: 'Origen no permitido' });
  }

  console.error('[Error no controlado]', err);

  return res.status(err?.status || 500).json({
    message: 'Error interno del servidor',
    ...(IS_PROD ? {} : { detalle: err?.message }),
  });
});


app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
