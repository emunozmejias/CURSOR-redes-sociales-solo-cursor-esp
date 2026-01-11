# Backend de Microservicios - Guía de Implementación

## Arquitectura del Backend

El backend está estructurado como una arquitectura de microservicios con un API Gateway central que enruta las peticiones a los diferentes microservicios:

```
API Gateway (puerto 3001)
├── Auth Service (puerto 3002) - Autenticación y autorización
├── Users Service (puerto 3003) - Gestión de usuarios
├── Posts Service (puerto 3004) - Publicaciones
└── Comments Service (puerto 3005) - Comentarios y likes
```

Base de datos: PostgreSQL en Neon.tech

---

## PASO 1: Configurar PostgreSQL en Neon.tech

### 1.1 Crear cuenta y proyecto en Neon.tech

1. Ve a https://neon.tech/
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Elige la región más cercana
5. Guarda la **Connection String** que te proporcionan (algo como: `postgresql://user:password@host/dbname?sslmode=require`)

### 1.2 Obtener la Connection String

En el dashboard de Neon.tech, encontrarás la connection string en la sección "Connection Details". Guárdala de forma segura, la necesitarás más adelante.

---

## PASO 2: Estructura del Proyecto Backend

```
backend/
├── gateway/                  # API Gateway
│   ├── src/
│   │   ├── index.js         # Servidor principal del gateway
│   │   ├── routes.js        # Rutas del gateway
│   │   └── middleware/      # Middleware compartido
│   ├── package.json
│   └── .env
│
├── services/
│   ├── auth-service/        # Microservicio de autenticación
│   │   ├── src/
│   │   │   ├── index.js
│   │   │   ├── routes.js
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   └── utils/
│   │   ├── package.json
│   │   └── .env
│   │
│   ├── users-service/       # Microservicio de usuarios
│   │   ├── src/
│   │   ├── package.json
│   │   └── .env
│   │
│   ├── posts-service/       # Microservicio de publicaciones
│   │   ├── src/
│   │   ├── package.json
│   │   └── .env
│   │
│   └── comments-service/    # Microservicio de comentarios
│       ├── src/
│       ├── package.json
│       └── .env
│
├── shared/                   # Código compartido
│   ├── database/            # Configuración de base de datos
│   │   └── connection.js
│   ├── models/              # Modelos compartidos
│   └── utils/               # Utilidades compartidas
│
├── package.json             # Package.json raíz (workspace)
└── .env.example             # Ejemplo de variables de entorno
```

---

## PASO 3: Configurar el Workspace (Opcional pero Recomendado)

### 3.1 Crear package.json raíz

Crea un `package.json` en la raíz de `backend/` para manejar todos los servicios:

```json
{
  "name": "social-app-backend",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "gateway",
    "services/*"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:gateway\" \"npm run dev:auth\" \"npm run dev:users\" \"npm run dev:posts\" \"npm run dev:comments\"",
    "dev:gateway": "cd gateway && npm run dev",
    "dev:auth": "cd services/auth-service && npm run dev",
    "dev:users": "cd services/users-service && npm run dev",
    "dev:posts": "cd services/posts-service && npm run dev",
    "dev:comments": "cd services/comments-service && npm run dev"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

---

## PASO 4: Configurar Base de Datos Compartida

### 4.1 Crear conexión a PostgreSQL

En `backend/shared/database/connection.js`:

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('connect', () => {
  console.log('✅ Conectado a PostgreSQL en Neon.tech');
});

pool.on('error', (err) => {
  console.error('❌ Error en la conexión a PostgreSQL:', err);
});

module.exports = pool;
```

### 4.2 Crear Scripts SQL para las Tablas

En `backend/shared/database/schema.sql`:

```sql
-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  bio TEXT,
  avatar TEXT,
  cover_image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de publicaciones
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  images JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de likes
CREATE TABLE IF NOT EXISTS likes (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id)
);

-- Tabla de comentarios
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
```

---

## PASO 5: Crear Auth Service (Microservicio de Autenticación)

### 5.1 Configurar Auth Service

En `backend/services/auth-service/package.json`:

```json
{
  "name": "auth-service",
  "version": "1.0.0",
  "main": "src/index.js",
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "pg": "^8.11.3"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### 5.2 Configurar Variables de Entorno

En `backend/services/auth-service/.env`:

```env
PORT=3002
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=tu_secret_key_super_segura_aqui
JWT_EXPIRES_IN=7d
```

### 5.3 Crear Servidor Auth Service

En `backend/services/auth-service/src/index.js`:

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'auth-service' });
});

app.listen(PORT, () => {
  console.log(`🚀 Auth Service corriendo en puerto ${PORT}`);
});
```

### 5.4 Crear Rutas de Autenticación

En `backend/services/auth-service/src/routes.js`:

```javascript
const express = require('express');
const router = express.Router();
const authController = require('./controllers/authController');
const { authenticateToken } = require('./middleware/authMiddleware');

// Registro
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Verificar token
router.get('/verify', authenticateToken, authController.verify);

// Refresh token (opcional)
router.post('/refresh', authController.refresh);

module.exports = router;
```

### 5.5 Crear Controller de Autenticación

En `backend/services/auth-service/src/controllers/authController.js`:

```javascript
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../../../shared/database/connection');

const register = async (req, res) => {
  try {
    const { email, username, password, name } = req.body;

    // Validaciones
    if (!email || !username || !password || !name) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Verificar si el usuario ya existe
    const userExists = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'El email o username ya existe' });
    }

    // Hash de la contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Crear usuario
    const result = await pool.query(
      `INSERT INTO users (email, username, password_hash, name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, username, name, created_at`,
      [email, username, passwordHash, name]
    );

    const user = result.rows[0];

    // Generar JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Buscar usuario
    const result = await pool.query(
      'SELECT id, email, username, password_hash, name, bio, avatar FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = result.rows[0];

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        bio: user.bio,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const verify = async (req, res) => {
  res.json({ valid: true, user: req.user });
};

const refresh = async (req, res) => {
  // Implementar refresh token si es necesario
  res.status(501).json({ error: 'No implementado aún' });
};

module.exports = {
  register,
  login,
  verify,
  refresh
};
```

### 5.6 Crear Middleware de Autenticación

En `backend/services/auth-service/src/middleware/authMiddleware.js`:

```javascript
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
```

---

## PASO 6: Crear API Gateway

### 6.1 Configurar Gateway

En `backend/gateway/package.json`:

```json
{
  "name": "api-gateway",
  "version": "1.0.0",
  "main": "src/index.js",
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "http-proxy-middleware": "^2.0.6",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### 6.2 Configurar Variables de Entorno

En `backend/gateway/.env`:

```env
PORT=3001
AUTH_SERVICE_URL=http://localhost:3002
USERS_SERVICE_URL=http://localhost:3003
POSTS_SERVICE_URL=http://localhost:3004
COMMENTS_SERVICE_URL=http://localhost:3005
```

### 6.3 Crear Servidor Gateway

En `backend/gateway/src/index.js`:

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas proxy
app.use(routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'api-gateway',
    services: {
      auth: process.env.AUTH_SERVICE_URL,
      users: process.env.USERS_SERVICE_URL,
      posts: process.env.POSTS_SERVICE_URL,
      comments: process.env.COMMENTS_SERVICE_URL
    }
  });
});

app.listen(PORT, () => {
  console.log(`🌐 API Gateway corriendo en puerto ${PORT}`);
  console.log(`   Rutas disponibles:`);
  console.log(`   - Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   - Users: http://localhost:${PORT}/api/users`);
  console.log(`   - Posts: http://localhost:${PORT}/api/posts`);
  console.log(`   - Comments: http://localhost:${PORT}/api/comments`);
});
```

### 6.4 Configurar Rutas del Gateway

En `backend/gateway/src/routes.js`:

```javascript
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const router = express.Router();

// Proxy para Auth Service
router.use('/api/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/api/auth'
  }
}));

// Proxy para Users Service
router.use('/api/users', createProxyMiddleware({
  target: process.env.USERS_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/users': '/api/users'
  }
}));

// Proxy para Posts Service
router.use('/api/posts', createProxyMiddleware({
  target: process.env.POSTS_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/posts': '/api/posts'
  }
}));

// Proxy para Comments Service
router.use('/api/comments', createProxyMiddleware({
  target: process.env.COMMENTS_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/comments': '/api/comments'
  }
}));

module.exports = router;
```

---

## PASO 7: Implementar los Otros Microservicios

Sigue el mismo patrón para crear:
- **Users Service** (puerto 3003): CRUD de usuarios, actualización de perfil
- **Posts Service** (puerto 3004): CRUD de publicaciones
- **Comments Service** (puerto 3005): Comentarios y likes

---

## PASO 8: Inicializar la Base de Datos

### 8.1 Crear Script de Inicialización

En `backend/shared/database/init.js`:

```javascript
const pool = require('./connection');
const fs = require('fs');
const path = require('path');

const initDatabase = async () => {
  try {
    const schema = fs.readFileSync(
      path.join(__dirname, 'schema.sql'),
      'utf8'
    );
    
    await pool.query(schema);
    console.log('✅ Base de datos inicializada correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    process.exit(1);
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  initDatabase().then(() => process.exit(0));
}

module.exports = initDatabase;
```

Ejecutar: `node shared/database/init.js`

---

## PASO 9: Ejecutar el Backend

### 9.1 Instalar Dependencias

```bash
cd backend
npm install
```

### 9.2 Ejecutar Todos los Servicios

```bash
npm run dev
```

O ejecutar cada servicio individualmente en terminales separadas.

---

## PASO 10: Probar la API

### Registro de Usuario

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "username": "usuario123",
    "password": "password123",
    "name": "Usuario Demo"
  }'
```

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "password123"
  }'
```

---

## Notas Importantes

1. **Seguridad**: Nunca commitees las variables de entorno con valores reales
2. **JWT_SECRET**: Debe ser una cadena larga y aleatoria en producción
3. **CORS**: Configura los orígenes permitidos según tu frontend
4. **Validación**: Agrega validación de datos (usando librerías como `joi` o `zod`)
5. **Logging**: Implementa un sistema de logging adecuado
6. **Testing**: Agrega tests unitarios e integración

---

## Próximos Pasos

- Implementar los otros microservicios (Users, Posts, Comments)
- Agregar manejo de imágenes (subida a S3 o similar)
- Implementar paginación en las consultas
- Agregar rate limiting
- Implementar logging estructurado
- Agregar tests
- Configurar CI/CD
