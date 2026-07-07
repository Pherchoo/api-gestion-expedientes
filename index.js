require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const connectDB = require('./src/config/db');

const app = express();

// Middlewares
app.use(helmet());
app.use(express.json());

// Conectar BD
connectDB();

// Rutas (las agregaremos después)
app.use('/api/expedientes', require('./src/routes/expedientes'));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API de Gestión de Expedientes funcionando 🚀' });
});

const PORT = process.env.PORT || 5200;   // Usamos 5200 para diferenciar del primer proyecto

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});