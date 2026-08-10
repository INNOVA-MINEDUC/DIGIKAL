import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import sequelize from './config/connection.js';
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
import path from 'path';



const app = express();
app.set('trust proxy', 1); // Confiar en el proxy reverso (Nginx/Docker) para express-rate-limit
const PORT = process.env.PORT;


app.use(cors({
  origin: process.env.FRONTEND_URL, 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Importante: express.json() solo procesa JSON, Multer se encarga del multipart
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


try {
  await sequelize.authenticate();
  console.log('✅ Conectado a la base de datos');
} catch (error) {
  console.error('❌ Error de conexión:', error);
}

// Respaldo local de bucketService: cuando el bucket no está disponible los
// archivos se guardan aquí. Ruta absoluta para no depender del cwd con el que
// se arranque el proceso (npm start vs docker).
app.use('/uploads', express.static(path.resolve('uploads')));

app.use('/api/v1/auth', loginRoutes);
app.use('/api/v1/escuelas', escuelaRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/equipos', equipoRoutes);
app.use('/api/v1/tipo_equipos', tipoequipoRoutes);
app.use('/api/v1/dotacion', dotacionRoutes); 
app.use('/api/v1/user', userRoutes); 
app.use('/api/v1/role', roleRoutes); 
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/estadisticas', estadisticasRoutes);



app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
