# Guía de Instalación y Ejecución del Backend

## Prerrequisitos

- Node.js 20.19.6 (usando nvm)
- npm
- PostgreSQL en Neon.tech configurado
- Connection string de Neon.tech

## PASO 9: Instalación y Ejecución

### 9.1 Configurar Variables de Entorno

Antes de instalar, asegúrate de configurar `backend/.env` con tu connection string:

```bash
# Edita backend/.env y agrega tu connection string de Neon.tech
DATABASE_URL=postgresql://tu_usuario:tu_password@tu_host/dbname?sslmode=require
JWT_SECRET=una_clave_secreta_super_larga_y_aleatoria
```

### 9.2 Instalar Dependencias

Desde la raíz del proyecto:

```bash
cd backend
nvm use 20.19.6
npm install
```

Esto instalará todas las dependencias de:
- Gateway
- Auth Service
- Users Service
- Posts Service
- Comments Service
- Configuración compartida (dotenv, pg, etc.)

### 9.3 Inicializar la Base de Datos

Antes de ejecutar los servicios, inicializa las tablas en PostgreSQL:

```bash
npm run init-db
```

Este comando ejecutará el script `shared/database/init.js` que creará todas las tablas necesarias.

### 9.4 Ejecutar Todos los Servicios

Para ejecutar todos los servicios simultáneamente:

```bash
npm run dev
```

Esto iniciará:
- 🌐 API Gateway en puerto 3001
- 🔐 Auth Service en puerto 3002
- 👤 Users Service en puerto 3003
- 📝 Posts Service en puerto 3004
- 💬 Comments Service en puerto 3005

### 9.5 Ejecutar Servicios Individualmente

Si prefieres ejecutar cada servicio en una terminal separada:

```bash
# Terminal 1 - Gateway
npm run dev:gateway

# Terminal 2 - Auth Service
npm run dev:auth

# Terminal 3 - Users Service
npm run dev:users

# Terminal 4 - Posts Service
npm run dev:posts

# Terminal 5 - Comments Service
npm run dev:comments
```

## Verificación

### Health Checks

Verifica que todos los servicios estén corriendo:

```bash
# Gateway
curl http://localhost:3001/health

# Auth Service
curl http://localhost:3002/health

# Users Service
curl http://localhost:3003/health

# Posts Service
curl http://localhost:3004/health

# Comments Service
curl http://localhost:3005/health
```

Todos deberían responder con `{"status":"OK","service":"..."}`

## Solución de Problemas

### Error: "Cannot find module 'pg'"
- Asegúrate de haber ejecutado `npm install` desde la raíz del backend

### Error: "Connection refused" o "ECONNREFUSED"
- Verifica que tu `DATABASE_URL` en `.env` sea correcta
- Verifica que Neon.tech esté accesible
- Asegúrate de incluir `?sslmode=require` en la connection string

### Error: "relation 'users' does not exist"
- Ejecuta `npm run init-db` para crear las tablas

### Los servicios no inician
- Verifica que los puertos 3001-3005 no estén en uso
- Revisa los logs de error en la consola

## Estructura de URLs

Una vez ejecutando, las URLs disponibles son:

- **API Gateway**: http://localhost:3001
  - `/api/auth/*` → Auth Service
  - `/api/users/*` → Users Service
  - `/api/posts/*` → Posts Service
  - `/api/comments/*` → Comments Service

- **Servicios directos**:
  - Auth: http://localhost:3002
  - Users: http://localhost:3003
  - Posts: http://localhost:3004
  - Comments: http://localhost:3005

## Próximos Pasos

Una vez que todos los servicios estén corriendo:

1. Prueba el registro de usuarios: `POST /api/auth/register`
2. Prueba el login: `POST /api/auth/login`
3. Prueba crear una publicación: `POST /api/posts`
4. Conecta el frontend para usar la API
