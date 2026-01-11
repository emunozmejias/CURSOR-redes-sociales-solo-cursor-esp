const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require(path.resolve(__dirname, '../..', 'shared/config'));
const routes = require('./routes');

const app = express();
const PORT = config.ports.gateway;

// Middleware básico
app.use(cors());
app.use(express.json());

// Middleware de logging DESPUÉS de parsear JSON
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[Gateway ${timestamp}] 📥 ${req.method} ${req.url}`);
  console.log(`[Gateway] Headers recibidos:`, JSON.stringify(req.headers, null, 2));
  console.log(`[Gateway] IP:`, req.ip || req.connection.remoteAddress);
  
  // Log del body si existe (ahora ya está parseado)
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`[Gateway] Body recibido:`, JSON.stringify(req.body, null, 2));
  }
  
  // Log cuando se envía la respuesta
  const originalSend = res.send;
  const originalJson = res.json;
  
  res.send = function(data) {
    console.log(`[Gateway] 📤 Enviando respuesta ${res.statusCode} para ${req.method} ${req.url}`);
    return originalSend.call(this, data);
  };
  
  res.json = function(data) {
    console.log(`[Gateway] 📤 Enviando respuesta JSON ${res.statusCode} para ${req.method} ${req.url}`);
    return originalJson.call(this, data);
  };
  
  next();
});

// Rutas proxy
app.use(routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'api-gateway',
    services: {
      auth: config.services.auth,
      users: config.services.users,
      posts: config.services.posts,
      comments: config.services.comments
    }
  });
});

const server = app.listen(PORT, () => {
  console.log(`🌐 API Gateway corriendo en puerto ${PORT}`);
  console.log(`   Rutas disponibles:`);
  console.log(`   - Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   - Users: http://localhost:${PORT}/api/users`);
  console.log(`   - Posts: http://localhost:${PORT}/api/posts`);
  console.log(`   - Comments: http://localhost:${PORT}/api/comments`);
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
