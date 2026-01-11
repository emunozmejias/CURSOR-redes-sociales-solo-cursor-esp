# Configuración Centralizada

Este directorio contiene la configuración centralizada para todos los servicios del backend.

## Archivo Principal

`index.js` - Exporta un objeto de configuración que carga todas las variables de entorno desde el archivo `.env` en la raíz del backend.

## Uso

### En cualquier servicio:

```javascript
const config = require('../../shared/config');

// Acceder a la configuración de base de datos
const dbUrl = config.database.url;

// Acceder a JWT
const jwtSecret = config.jwt.secret;

// Acceder a puertos
const authPort = config.ports.auth;

// Acceder a URLs de servicios
const authServiceUrl = config.services.auth;
```

### En la conexión a la base de datos:

```javascript
const config = require('../../shared/config');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: config.database.url,
  ssl: config.database.ssl
});
```

## Variables de Entorno

Todas las variables de entorno se cargan desde `backend/.env`:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=tu_secret_key
JWT_EXPIRES_IN=7d
GATEWAY_PORT=3001
AUTH_SERVICE_PORT=3002
USERS_SERVICE_PORT=3003
POSTS_SERVICE_PORT=3004
COMMENTS_SERVICE_PORT=3005
AUTH_SERVICE_URL=http://localhost:3002
USERS_SERVICE_URL=http://localhost:3003
POSTS_SERVICE_URL=http://localhost:3004
COMMENTS_SERVICE_URL=http://localhost:3005
```

## Ventajas

- ✅ Configuración única: un solo lugar para todas las variables
- ✅ Sin duplicación: no necesitas archivos .env en cada servicio
- ✅ Fácil mantenimiento: cambios en un solo lugar
- ✅ Validación: verifica que las variables críticas estén presentes
- ✅ Valores por defecto: proporciona valores sensatos si faltan variables
