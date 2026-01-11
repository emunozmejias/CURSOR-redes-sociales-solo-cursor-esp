/**
 * Helper para resolver rutas a módulos compartidos
 * Desde cualquier ubicación en los servicios, resuelve correctamente las rutas al backend
 */
const path = require('path');

/**
 * Resuelve la ruta al directorio raíz del backend
 * Funciona desde cualquier nivel de profundidad en services/*/src/*
 */
function getBackendRoot() {
  // Intenta encontrar backend/ subiendo desde __dirname
  let current = __dirname;
  
  // Buscar hasta encontrar el directorio backend
  while (current !== path.dirname(current)) {
    if (path.basename(current) === 'backend') {
      return current;
    }
    current = path.dirname(current);
  }
  
  // Fallback: asumir que estamos en backend/shared/utils y subir 2 niveles
  return path.resolve(__dirname, '../..');
}

/**
 * Requiere un módulo desde shared/
 * @param {string} modulePath - Ruta relativa desde shared/ (ej: 'config', 'database/connection')
 */
function requireShared(modulePath) {
  const backendRoot = getBackendRoot();
  return require(path.join(backendRoot, 'shared', modulePath));
}

module.exports = {
  getBackendRoot,
  requireShared
};
