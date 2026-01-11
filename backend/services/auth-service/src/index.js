const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require(path.resolve(__dirname, '../../..', 'shared/config'));
const authRoutes = require('./routes');

const app = express();
const PORT = config.ports.auth;

// Middleware de logging para todas las peticiones
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[Auth Service ${timestamp}] 📥 ${req.method} ${req.url}`);
  console.log(`[Auth Service] Headers recibidos:`, JSON.stringify(req.headers, null, 2));
  console.log(`[Auth Service] IP:`, req.ip || req.connection.remoteAddress);
  
  // Log del body si existe
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`[Auth Service] Body recibido:`, JSON.stringify(req.body, null, 2));
  }
  
  // Log cuando se envía la respuesta
  const originalSend = res.send;
  const originalJson = res.json;
  
  res.send = function(data) {
    console.log(`[Auth Service] 📤 Enviando respuesta ${res.statusCode} para ${req.method} ${req.url}`);
    console.log(`[Auth Service] Tamaño de respuesta:`, data ? data.length : 0, 'bytes');
    return originalSend.call(this, data);
  };
  
  res.json = function(data) {
    console.log(`[Auth Service] 📤 Enviando respuesta JSON ${res.statusCode} para ${req.method} ${req.url}`);
    console.log(`[Auth Service] Datos de respuesta:`, JSON.stringify(data, null, 2));
    return originalJson.call(this, data);
  };
  
  next();
});

// Middleware
app.use(cors());
app.use(express.json());

// Manejo de errores de parsing JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error(`[Auth Service] ❌ Error al parsear JSON:`, err.message);
    return res.status(400).json({ error: 'JSON inválido en el body' });
  }
  next();
});

// Rutas
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'auth-service' });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Auth Service corriendo en puerto ${PORT}`);
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

// Log cuando el servidor se cierra
process.on('SIGTERM', () => {
  console.log('[Auth Service] 🔴 Recibida señal SIGTERM, cerrando servidor...');
  server.close(() => {
    console.log('[Auth Service] ✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[Auth Service] 🔴 Recibida señal SIGINT, cerrando servidor...');
  server.close(() => {
    console.log('[Auth Service] ✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Auth Service] ❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[Auth Service] ❌ Uncaught Exception:', error);
  process.exit(1);
});
