// Cargar .env desde la raíz del backend
// Resuelve la ruta de forma más robusta
const path = require('path');
const fs = require('fs');

// Intentar diferentes rutas posibles para encontrar el .env
let envPath = null;
const possiblePaths = [
  path.resolve(__dirname, '../../.env'),  // Desde shared/config/
  path.resolve(__dirname, '../../../.env'), // Desde shared/ (fallback)
  path.join(process.cwd(), '.env'), // Desde el directorio actual de trabajo
];

for (const possiblePath of possiblePaths) {
  if (fs.existsSync(possiblePath)) {
    envPath = possiblePath;
    break;
  }
}

if (envPath) {
  const result = require('dotenv').config({ path: envPath });
  if (result.error && result.error.code !== 'ENOENT') {
    console.warn('⚠️  Advertencia al cargar .env:', result.error.message);
  }
} else {
  // Si no encontramos el .env, intentar cargar desde el directorio actual
  require('dotenv').config();
}

/**
 * Configuración centralizada para todos los servicios
 * Carga las variables de entorno desde el archivo .env en la raíz del backend
 */
const config = {
  // Base de datos
  database: {
    url: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  // Puertos de los servicios
  ports: {
    gateway: parseInt(process.env.GATEWAY_PORT) || 3001,
    auth: parseInt(process.env.AUTH_SERVICE_PORT) || 3002,
    users: parseInt(process.env.USERS_SERVICE_PORT) || 3003,
    posts: parseInt(process.env.POSTS_SERVICE_PORT) || 3004,
    comments: parseInt(process.env.COMMENTS_SERVICE_PORT) || 3005
  },

  // URLs de los servicios (para el gateway)
  services: {
    auth: process.env.AUTH_SERVICE_URL || `http://localhost:${parseInt(process.env.AUTH_SERVICE_PORT) || 3002}`,
    users: process.env.USERS_SERVICE_URL || `http://localhost:${parseInt(process.env.USERS_SERVICE_PORT) || 3003}`,
    posts: process.env.POSTS_SERVICE_URL || `http://localhost:${parseInt(process.env.POSTS_SERVICE_PORT) || 3004}`,
    comments: process.env.COMMENTS_SERVICE_URL || `http://localhost:${parseInt(process.env.COMMENTS_SERVICE_PORT) || 3005}`
  },

  // Entorno
  env: process.env.NODE_ENV || 'development',

  // Validación de configuración crítica
  validate(showWarnings = true) {
    const required = [
      'DATABASE_URL'
    ];

    const missing = required.filter(key => {
      const value = process.env[key];
      // Verificar si está vacío, es null, undefined, o es un placeholder
      if (!value || typeof value !== 'string') {
        return true;
      }
      // Verificar si es un placeholder común
      if (value.includes('user:password@host/dbname') || 
          value === 'postgresql://user:password@host/dbname?sslmode=require' ||
          value.trim().length === 0) {
        return true;
      }
      return false;
    });

    if (missing.length > 0 && showWarnings) {
      // Solo mostrar advertencia si realmente falta, no si está configurado correctamente
      const actualValue = process.env.DATABASE_URL;
      if (!actualValue || actualValue.includes('user:password@host/dbname')) {
        console.warn('⚠️  Advertencia: DATABASE_URL no está configurado correctamente');
        console.warn('   Asegúrate de tener un archivo .env en la raíz del backend/');
        console.warn('   Edita backend/.env y agrega tu connection string de Neon.tech');
      }
    }

    return missing.length === 0;
  }
};

// NO validar automáticamente al cargar el módulo
// La validación se hará cuando sea necesario, después de que dotenv haya cargado

module.exports = config;
