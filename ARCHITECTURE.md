# 📐 Arquitectura y Estructura del Proyecto

## 🏗️ Visión General

Este es un proyecto **monorepo** de una aplicación de redes sociales que sigue una arquitectura de **frontend y backend separados**, donde el backend está construido como una **arquitectura de microservicios**.

```
cursor-redes-sociales-solo-cursor-esp/
├── frontend/          # Aplicación cliente (Next.js)
├── backend/           # Backend de microservicios (Node.js)
└── README.md          # Documentación principal
```

---

## 🎨 FRONTEND

### Tecnologías Principales

- **Next.js 16.1.1** - Framework React con App Router
- **React 19.2.3** - Biblioteca de UI
- **TypeScript 5** - Tipado estático
- **Tailwind CSS 4** - Framework de estilos utilitarios

### Estructura del Frontend

```
frontend/
├── app/                    # App Router de Next.js
│   ├── page.tsx           # Página de inicio (feed)
│   ├── perfil/            # Página de perfil de usuario
│   ├── crear-publicacion/ # Página para crear posts
│   ├── login/             # Página de inicio de sesión
│   ├── registro/          # Página de registro
│   ├── layout.tsx         # Layout principal (wraps toda la app)
│   └── globals.css        # Estilos globales
│
├── components/            # Componentes React reutilizables
│   ├── Header.tsx         # Cabecera de la aplicación
│   ├── Footer.tsx         # Pie de página
│   ├── Navigation.tsx     # Navegación móvil por pestañas
│   ├── PostCard.tsx       # Tarjeta de publicación (vista normal)
│   ├── PostCardEditable.tsx  # Tarjeta editable (con opciones editar/eliminar)
│   └── EditPostModal.tsx  # Modal para editar publicaciones
│
├── context/               # Context API de React (Estado global)
│   └── SocialContext.tsx  # Contexto principal que maneja:
│                          # - Usuario actual
│                          # - Lista de posts
│                          # - Posts del usuario
│                          # - Funciones CRUD
│
├── lib/                   # Utilidades y servicios
│   ├── config.ts          # Configuración (URL del API)
│   └── api.ts             # Cliente API para comunicación con backend
│                          # - authApi (login, registro, verify)
│                          # - usersApi (perfil, actualizar)
│                          # - postsApi (CRUD de posts)
│                          # - commentsApi (comentarios, likes)
│
└── types/                 # Definiciones TypeScript
    └── index.ts           # Interfaces: User, Post, Comment, Like
```

### Características del Frontend

1. **Routing**: Next.js App Router con rutas:
   - `/` - Feed de publicaciones
   - `/perfil` - Perfil del usuario autenticado
   - `/crear-publicacion` - Crear nueva publicación
   - `/login` - Iniciar sesión
   - `/registro` - Registro de nuevos usuarios

2. **Estado Global**: Context API para:
   - Usuario autenticado
   - Lista de publicaciones
   - Publicaciones del usuario
   - Funciones para CRUD de posts, comentarios, likes

3. **Autenticación**:
   - Token JWT almacenado en `localStorage`
   - Verificación automática al cargar la app
   - Redirección a login si no hay token válido

4. **Comunicación con Backend**:
   - Todas las peticiones pasan por el API Gateway (`http://localhost:3001`)
   - Headers automáticos con token JWT
   - Manejo centralizado de errores

---

## ⚙️ BACKEND

### Tecnologías Principales

- **Node.js v20.19.6** - Runtime de JavaScript
- **Express.js** - Framework web minimalista
- **PostgreSQL** (Neon.tech) - Base de datos relacional
- **JWT** (jsonwebtoken) - Autenticación con tokens
- **bcrypt** - Hash de contraseñas
- **http-proxy-middleware** - Proxy para API Gateway
- **concurrently** - Ejecución simultánea de servicios
- **nodemon** - Auto-reload en desarrollo

### Arquitectura: Microservicios

El backend está organizado como una **arquitectura de microservicios** con un **API Gateway** que actúa como punto de entrada único:

```
Request → API Gateway (Puerto 3001) → Microservicio correspondiente
```

### Estructura del Backend

```
backend/
├── gateway/               # API Gateway (Punto de entrada único)
│   └── src/
│       ├── index.js      # Servidor Express del Gateway
│       └── routes.js     # Configuración de proxies a microservicios
│
├── services/              # Microservicios
│   ├── auth-service/     # Servicio de autenticación (Puerto 3002)
│   │   └── src/
│   │       ├── index.js
│   │       ├── routes.js
│   │       ├── controllers/
│   │       │   └── authController.js  # register, login, verify
│   │       └── middleware/
│   │           └── authMiddleware.js  # Verificación JWT
│   │
│   ├── users-service/    # Servicio de usuarios (Puerto 3003)
│   │   └── src/
│   │       ├── index.js
│   │       ├── routes.js
│   │       └── controllers/
│   │           └── usersController.js  # getMe, updateMe
│   │
│   ├── posts-service/    # Servicio de publicaciones (Puerto 3004)
│   │   └── src/
│   │       ├── index.js
│   │       ├── routes.js
│   │       └── controllers/
│   │           └── postsController.js  # CRUD de posts
│   │
│   └── comments-service/ # Servicio de comentarios y likes (Puerto 3005)
│       └── src/
│           ├── index.js
│           ├── routes.js
│           └── controllers/
│               ├── commentsController.js  # CRUD de comentarios
│               └── likesController.js     # toggleLike, getLikes
│
├── shared/                # Código compartido entre servicios
│   ├── config/
│   │   └── index.js      # Configuración centralizada:
│   │                      # - DATABASE_URL
│   │                      # - JWT_SECRET
│   │                      # - URLs y puertos de servicios
│   │
│   ├── database/
│   │   ├── connection.js  # Pool de conexiones PostgreSQL
│   │   ├── schema.sql     # Esquema de la base de datos
│   │   └── init.js        # Script de inicialización de BD
│   │
│   └── utils/            # Utilidades compartidas
│
├── package.json          # Workspace root con scripts para ejecutar todos los servicios
└── .env                  # Variables de entorno (DATABASE_URL, JWT_SECRET, etc.)
```

### Microservicios Detallados

#### 1. API Gateway (Puerto 3001)
- **Función**: Punto de entrada único para todas las peticiones
- **Tecnología**: Express.js + http-proxy-middleware
- **Rutas**:
  - `/api/auth/*` → Proxy a `auth-service:3002`
  - `/api/users/*` → Proxy a `users-service:3003`
  - `/api/posts/*` → Proxy a `posts-service:3004`
  - `/api/comments/*` → Proxy a `comments-service:3005`
- **Funcionalidades**:
  - Logging detallado de todas las peticiones
  - Manejo de errores
  - Verificación de disponibilidad de servicios
  - Reenvío correcto de bodies cuando Express los parsea

#### 2. Auth Service (Puerto 3002)
- **Responsabilidad**: Autenticación y autorización
- **Endpoints**:
  - `POST /api/auth/register` - Registro de nuevos usuarios
  - `POST /api/auth/login` - Inicio de sesión (retorna JWT)
  - `GET /api/auth/verify` - Verificar token y obtener usuario
- **Funcionalidades**:
  - Hash de contraseñas con bcrypt
  - Generación de tokens JWT
  - Verificación de tokens

#### 3. Users Service (Puerto 3003)
- **Responsabilidad**: Gestión de perfiles de usuario
- **Endpoints**:
  - `GET /api/users/me` - Obtener perfil del usuario autenticado
  - `PUT /api/users/me` - Actualizar perfil del usuario
- **Autenticación**: Requiere token JWT válido

#### 4. Posts Service (Puerto 3004)
- **Responsabilidad**: Gestión de publicaciones
- **Endpoints**:
  - `GET /api/posts` - Obtener feed de publicaciones (paginated)
  - `GET /api/posts/:id` - Obtener publicación por ID
  - `GET /api/posts/user/:userId` - Obtener posts de un usuario
  - `POST /api/posts` - Crear nueva publicación
  - `PUT /api/posts/:id` - Actualizar publicación (solo dueño)
  - `DELETE /api/posts/:id` - Eliminar publicación (solo dueño)
- **Autenticación**: Crear/editar/eliminar requieren token JWT

#### 5. Comments Service (Puerto 3005)
- **Responsabilidad**: Comentarios y likes
- **Endpoints**:
  - `GET /api/comments/post/:postId` - Obtener comentarios de un post
  - `POST /api/comments/post/:postId` - Crear comentario
  - `POST /api/comments/post/:postId/like` - Toggle like (dar/quitar)
  - `GET /api/comments/post/:postId/likes` - Obtener likes de un post
- **Autenticación**: Todas las operaciones requieren token JWT

---

## 🗄️ BASE DE DATOS

### PostgreSQL (Neon.tech)

**Esquema de la base de datos**:

```sql
1. users
   - id (SERIAL PRIMARY KEY)
   - email (UNIQUE)
   - username (UNIQUE)
   - password_hash
   - name
   - bio
   - avatar
   - cover_image
   - created_at

2. posts
   - id (SERIAL PRIMARY KEY)
   - user_id (FK → users.id)
   - content
   - images (JSONB)
   - created_at
   - updated_at
   - Índice en created_at DESC

3. comments
   - id (SERIAL PRIMARY KEY)
   - post_id (FK → posts.id)
   - user_id (FK → users.id)
   - content
   - created_at
   - updated_at

4. likes
   - id (SERIAL PRIMARY KEY)
   - post_id (FK → posts.id)
   - user_id (FK → users.id)
   - created_at
   - Constraint único en (post_id, user_id)
```

### Conexión

- **Proveedor**: Neon.tech (PostgreSQL serverless)
- **Cliente**: `pg` (node-postgres)
- **Pool de conexiones**: Configurado en `shared/database/connection.js`
- **SSL**: Habilitado para conexiones seguras

---

## 🔄 INTERACCIÓN ENTRE FRONTEND Y BACKEND

### Flujo de Comunicación

```
┌─────────────┐         ┌──────────────┐         ┌─────────────────┐
│   Frontend  │         │ API Gateway  │         │  Microservicio  │
│ (Next.js)   │────────▶│  (Express)   │────────▶│   (Express)     │
│ :3000       │         │   :3001      │         │   :3002-3005    │
└─────────────┘         └──────────────┘         └─────────────────┘
                                                          │
                                                          ▼
                                                  ┌──────────────┐
                                                  │  PostgreSQL  │
                                                  │  (Neon.tech) │
                                                  └──────────────┘
```

### Ejemplo de Flujo: Crear una Publicación

1. **Usuario** escribe contenido en `/crear-publicacion` y hace clic en "Publicar"

2. **Frontend** (`lib/api.ts`):
   ```typescript
   postsApi.create({ content: "...", images: [] })
   ```
   - Hace `POST` a `http://localhost:3001/api/posts`
   - Incluye token JWT en header `Authorization: Bearer <token>`

3. **API Gateway** (`gateway/src/routes.js`):
   - Recibe la petición en `/api/posts`
   - Verifica disponibilidad del servicio
   - Proxifica a `http://localhost:3004/api/posts`
   - Reenvía headers y body

4. **Posts Service** (`services/posts-service/src/controllers/postsController.js`):
   - Middleware `authenticateToken` verifica el JWT
   - Extrae `userId` del token
   - Valida datos (content no vacío)
   - Ejecuta `INSERT INTO posts ...` en PostgreSQL
   - Retorna el post creado

5. **Respuesta**:
   - Posts Service → API Gateway → Frontend
   - Frontend actualiza el estado en `SocialContext`
   - La publicación aparece en el feed

### Autenticación

1. **Login**:
   ```
   Frontend → POST /api/auth/login → Auth Service
   Auth Service verifica credenciales → Retorna JWT
   Frontend guarda JWT en localStorage
   ```

2. **Peticiones Autenticadas**:
   ```
   Frontend incluye: Authorization: Bearer <JWT>
   Gateway → Servicio → Middleware verifica JWT
   Si válido: extrae userId del token
   Si inválido: retorna 401/403
   ```

3. **Verificación**:
   ```
   Frontend al cargar → GET /api/auth/verify
   Auth Service verifica JWT → Obtiene usuario completo de BD
   Retorna información del usuario
   Frontend establece currentUser
   ```

---

## 🔧 CONFIGURACIÓN Y EJECUCIÓN

### Variables de Entorno

**Backend** (`backend/.env`):
```env
DATABASE_URL=postgresql://...@neon.tech/...
JWT_SECRET=tu_secreto_super_seguro
SERVICE_AUTH_URL=http://localhost:3002
SERVICE_USERS_URL=http://localhost:3003
SERVICE_POSTS_URL=http://localhost:3004
SERVICE_COMMENTS_URL=http://localhost:3005
```

**Frontend** (`frontend/.env.local` - opcional):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Scripts de Ejecución

**Backend**:
```bash
cd backend
npm install
npm run init-db      # Inicializar base de datos
npm run dev          # Ejecutar todos los servicios simultáneamente
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev          # Servidor de desarrollo en :3000
```

---

## 🎯 VENTAJAS DE ESTA ARQUITECTURA

### Microservicios
- ✅ **Escalabilidad independiente**: Cada servicio puede escalarse según necesidad
- ✅ **Separación de responsabilidades**: Cada servicio tiene un propósito claro
- ✅ **Desarrollo paralelo**: Equipos pueden trabajar en diferentes servicios
- ✅ **Tecnología flexible**: Cada servicio podría usar diferentes tecnologías
- ✅ **Aislamiento de fallos**: Un fallo en un servicio no afecta a los demás

### API Gateway
- ✅ **Punto único de entrada**: Facilita CORS, autenticación, logging
- ✅ **Encapsulación**: El frontend no conoce la arquitectura interna
- ✅ **Transformación de datos**: Posibilidad de agregar/transformar respuestas
- ✅ **Balanceo de carga**: Puede distribuir peticiones entre instancias

### Monorepo
- ✅ **Código compartido**: `shared/` contiene código reutilizable
- ✅ **Gestión unificada**: Un solo repositorio Git
- ✅ **Consistencia**: Mismas versiones de dependencias

---

## 📊 RESUMEN TECNOLÓGICO

| Componente | Tecnología | Versión | Puerto |
|------------|-----------|---------|--------|
| Frontend | Next.js | 16.1.1 | 3000 |
| Frontend | React | 19.2.3 | - |
| Frontend | TypeScript | 5 | - |
| Frontend | Tailwind CSS | 4 | - |
| API Gateway | Express.js | - | 3001 |
| Auth Service | Express.js | - | 3002 |
| Users Service | Express.js | - | 3003 |
| Posts Service | Express.js | - | 3004 |
| Comments Service | Express.js | - | 3005 |
| Base de Datos | PostgreSQL | - | Neon.tech |
| Runtime | Node.js | 20.19.6 | - |

---

## 🔐 SEGURIDAD

- **Autenticación**: JWT tokens con expiración
- **Contraseñas**: Hash con bcrypt (10 salt rounds)
- **Validación**: Validación de permisos en backend (solo dueño puede editar/eliminar)
- **CORS**: Configurado en todos los servicios
- **SQL Injection**: Prevenido con parámetros preparados (`$1, $2...`)
- **SSL**: Conexiones SSL a PostgreSQL

---

Esta arquitectura proporciona una base sólida, escalable y mantenible para una aplicación de redes sociales moderna.
