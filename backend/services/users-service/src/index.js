const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require(path.resolve(__dirname, '../../..', 'shared/config'));
const usersRoutes = require('./routes');

const app = express();
const PORT = config.ports.users;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/users', usersRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'users-service' });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Users Service corriendo en puerto ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Error: El puerto ${PORT} ya está en uso`);
    console.error(`   Cierra el proceso que está usando el puerto ${PORT} o ejecuta:`);
    console.error(`   lsof -ti:${PORT} | xargs kill -9`);
    process.exit(1);
  } else {
    console.error('❌ Error al iniciar el servidor:', err);
    process.exit(1);
  }
});
