import express from 'express';
import cors from 'cors';
import sequelize from './config/connection.js';
import politicaRoutes from './routes/politica.routes.js';
import escuelaRoutes from "./routes/escuela.routes.js";
import loginRoutes from './routes/auth.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import equipoRoutes from './routes/equipo.routes.js';
import tipoequipoRoutes from './routes/tipoequipo.routes.js';
import dotacionRoutes from './routes/dotacion.routes.js';
import proyectosRoutes from './routes/proyectos.routes.js';
import "./models/relations.js";
import path from 'path';



const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors({
  origin: "http://localhost:5173", 
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

app.use('/uploads/actas', express.static('uploads/actas'));
app.use('/uploads/imgs', express.static('uploads/imgs'));

app.use('/api/v1/auth', loginRoutes);
app.use('/api/v1/politicas', politicaRoutes);
app.use('/api/v1/escuelas', escuelaRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/equipos', equipoRoutes);
app.use('/api/v1/tipo_equipos', tipoequipoRoutes);
app.use('/api/v1/dotacion', dotacionRoutes); 
app.use('/api/v1/proyectos', proyectosRoutes); 

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});