/**
 * Ejemplo de cómo usar la configuración centralizada en los servicios
 * 
 * Este archivo es solo un ejemplo y puede ser eliminado.
 * Muestra cómo importar y usar la configuración compartida.
 */

const config = require('./index');

// Ejemplo 1: Usar en conexión a base de datos
console.log('Database URL:', config.database.url ? '✅ Configurado' : '❌ No configurado');

// Ejemplo 2: Usar JWT secret
console.log('JWT Secret:', config.jwt.secret ? '✅ Configurado' : '❌ No configurado');

// Ejemplo 3: Obtener puerto del servicio
console.log('Auth Service Port:', config.ports.auth);

// Ejemplo 4: Obtener URL de un servicio (para el gateway)
console.log('Auth Service URL:', config.services.auth);

// Ejemplo 5: Validar configuración
const isValid = config.validate();
console.log('Configuración válida:', isValid ? '✅' : '⚠️');
