const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const http = require('http');
const config = require(path.resolve(__dirname, '../..', 'shared/config'));

const router = express.Router();

// Función helper para verificar si un servicio está disponible
const checkServiceHealth = (serviceUrl, serviceName) => {
  return new Promise((resolve) => {
    const url = new URL(serviceUrl);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: '/health',
      method: 'GET',
      timeout: 2000
    };

    const req = http.request(options, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
};

// Función helper para manejar el body cuando Express ya lo parseó
// Basado en fixRequestBody de http-proxy-middleware
const handleParsedBody = (proxyReq, req) => {
  // Si Express ya parseó el body, necesitamos serializarlo y enviarlo manualmente
  // porque el stream original ya fue consumido
  if (req.body && Object.keys(req.body).length > 0) {
    const bodyData = JSON.stringify(req.body);
    console.log(`[Gateway] Body serializado desde req.body:`, bodyData);
    
    // Remover Content-Length existente para que se recalcule
    proxyReq.removeHeader('Content-Length');
    
    // Actualizar los headers
    proxyReq.setHeader('Content-Type', 'application/json');
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
    
    // Escribir el body en el proxy request (NO llamar end() - el proxy middleware lo maneja)
    proxyReq.write(bodyData);
  }
};

// Proxy para Auth Service
const authProxy = createProxyMiddleware({
  target: config.services.auth,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/api/auth'
  },
  timeout: 30000, // 30 segundos de timeout
  proxyTimeout: 30000,
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Gateway] ⏩ Preparando petición ${req.method} ${req.url} -> ${config.services.auth}${req.url}`);
    console.log(`[Gateway] Headers que se enviarán:`, JSON.stringify(proxyReq.getHeaders(), null, 2));
    handleParsedBody(proxyReq, req);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[Gateway] ⬅️ Respuesta recibida de Auth Service: ${proxyRes.statusCode} ${req.method} ${req.url}`);
    console.log(`[Gateway] Headers de respuesta:`, JSON.stringify(proxyRes.headers, null, 2));
  },
  onError: (err, req, res) => {
    console.error(`[Gateway] ❌ ERROR en proxy a Auth Service (${config.services.auth}):`);
    console.error(`[Gateway] Tipo de error:`, err.code || err.message);
    console.error(`[Gateway] Mensaje completo:`, err.message);
    console.error(`[Gateway] Stack trace:`, err.stack);
    console.error(`[Gateway] Request URL original:`, req.url);
    console.error(`[Gateway] Target URL:`, config.services.auth);
    console.error(`[Gateway] ¿Headers enviados?:`, res.headersSent);
    
    if (!res.headersSent) {
      res.status(503).json({ 
        error: 'Servicio de autenticación no disponible',
        details: err.message,
        code: err.code,
        target: config.services.auth,
        suggestion: 'Verifica que el Auth Service esté corriendo en el puerto 3002'
      });
    } else {
      console.error(`[Gateway] ⚠️ No se puede enviar respuesta de error - headers ya enviados`);
    }
  }
});

// Middleware para verificar disponibilidad antes de hacer proxy
router.use('/api/auth', async (req, res, next) => {
  console.log(`[Gateway] 🔍 Verificando disponibilidad de Auth Service en ${config.services.auth}...`);
  const isHealthy = await checkServiceHealth(config.services.auth, 'Auth Service');
  if (!isHealthy) {
    console.error(`[Gateway] ⚠️ Auth Service no está disponible en ${config.services.auth}`);
    console.error(`[Gateway] Verifica que el Auth Service esté corriendo: npm run dev:auth`);
    // Continuar con el proxy de todas formas para ver el error detallado
  } else {
    console.log(`[Gateway] ✅ Auth Service está disponible`);
  }
  next();
});

router.use('/api/auth', authProxy);

// Proxy para Users Service
router.use('/api/users', createProxyMiddleware({
  target: config.services.users,
  changeOrigin: true,
  pathRewrite: {
    '^/api/users': '/api/users'
  },
  timeout: 30000,
  proxyTimeout: 30000,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Gateway] ⏩ Enviando petición ${req.method} ${req.url} -> ${config.services.users}${req.url}`);
    handleParsedBody(proxyReq, req);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[Gateway] ⬅️ Respuesta recibida de ${config.services.users}: ${proxyRes.statusCode} ${req.method} ${req.url}`);
  },
  onError: (err, req, res) => {
    console.error(`[Gateway] ❌ ERROR en proxy a ${config.services.users}:`, err.message);
    if (!res.headersSent) {
      res.status(503).json({ error: 'Servicio de usuarios no disponible', details: err.message });
    }
  }
}));

// Proxy para Posts Service
router.use('/api/posts', createProxyMiddleware({
  target: config.services.posts,
  changeOrigin: true,
  pathRewrite: {
    '^/api/posts': '/api/posts'
  },
  timeout: 30000,
  proxyTimeout: 30000,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Gateway] ⏩ Enviando petición ${req.method} ${req.url} -> ${config.services.posts}${req.url}`);
    handleParsedBody(proxyReq, req);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[Gateway] ⬅️ Respuesta recibida de ${config.services.posts}: ${proxyRes.statusCode} ${req.method} ${req.url}`);
  },
  onError: (err, req, res) => {
    console.error(`[Gateway] ❌ ERROR en proxy a ${config.services.posts}:`, err.message);
    if (!res.headersSent) {
      res.status(503).json({ error: 'Servicio de publicaciones no disponible', details: err.message });
    }
  }
}));

// Proxy para Comments Service
router.use('/api/comments', createProxyMiddleware({
  target: config.services.comments,
  changeOrigin: true,
  pathRewrite: {
    '^/api/comments': '/api/comments'
  },
  timeout: 30000,
  proxyTimeout: 30000,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Gateway] ⏩ Enviando petición ${req.method} ${req.url} -> ${config.services.comments}${req.url}`);
    handleParsedBody(proxyReq, req);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[Gateway] ⬅️ Respuesta recibida de ${config.services.comments}: ${proxyRes.statusCode} ${req.method} ${req.url}`);
  },
  onError: (err, req, res) => {
    console.error(`[Gateway] ❌ ERROR en proxy a ${config.services.comments}:`, err.message);
    if (!res.headersSent) {
      res.status(503).json({ error: 'Servicio de comentarios no disponible', details: err.message });
    }
  }
}));

module.exports = router;
