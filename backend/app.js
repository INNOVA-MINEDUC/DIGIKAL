import express from 'express';
import cors from 'cors';
import sequelize from './config/connection.js';
import politicaRoutes from './routes/politica.routes.js';
import escuelaRoutes from "./routes/escuela.routes.js";
import entregaRoutes from './routes/entrega.routes.js';
import loginRoutes from './routes/auth.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import { authMiddleware } from './middlewares/auth.middleware.js';
import { obtenerEstablecimientos, obtenerEstudiantes } from "./services/apiClient.js"


const app = express();
const PORT = 3000;

app.use(cors({
  origin: "http://localhost:5173", // tu frontend
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));


app.use(express.json());


// Conexión DB
try {
  await sequelize.authenticate();
  console.log('✅ Conectado a la base de datos');
} catch (error) {
  console.error('❌ Error de conexión:', error);
}

// Ruta principal

app.get('/', obtenerEstablecimientos);
app.use('/api/v1/auth', loginRoutes);
// Usar rutas externas APIS
app.use('/api/v1/politicas', politicaRoutes);
app.use('/api/v1/escuelas', escuelaRoutes);
app.use('/api/v1/entregas', entregaRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

