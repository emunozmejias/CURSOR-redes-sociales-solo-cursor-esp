# Frontend - Red Social

Frontend de la aplicación de redes sociales construido con Next.js, React y TypeScript.

## 📋 Requisitos Previos

- Node.js v20.19.6 (usar `nvm use 20.19.6`)
- Backend corriendo en `http://localhost:3001` (ver `../backend/README.md`)

## 🚀 Instalación

```bash
# Instalar dependencias
npm install
```

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env.local` en la raíz del directorio `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Si no defines esta variable, el frontend usará `http://localhost:3001` por defecto.

## 🏃 Ejecutar el Proyecto

```bash
# Modo desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

## 🔗 Conectar Frontend con Backend

### Paso 1: Iniciar el Backend

En una terminal, desde el directorio `backend/`:

```bash
cd ../backend
npm run dev
```

Esto iniciará:
- API Gateway en `http://localhost:3001`
- Auth Service en `http://localhost:3002`
- Users Service en `http://localhost:3003`
- Posts Service en `http://localhost:3004`
- Comments Service en `http://localhost:3005`

### Paso 2: Iniciar el Frontend

En otra terminal, desde el directorio `frontend/`:

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

### Paso 3: Probar la Integración

1. **Registrar un usuario:**
   - Ve a `http://localhost:3000/registro`
   - Completa el formulario con tus datos
   - Haz clic en "Crear Cuenta"

2. **Iniciar sesión:**
   - Ve a `http://localhost:3000/login`
   - Ingresa tu email y contraseña
   - Haz clic en "Iniciar Sesión"

3. **Crear una publicación:**
   - Una vez autenticado, ve a "Crear publicación"
   - Escribe tu contenido y publica

4. **Ver el feed:**
   - En la página de inicio verás todas las publicaciones
   - Puedes dar likes y comentar

5. **Editar perfil:**
   - Ve a "Perfil"
   - Haz clic en "Editar perfil"
   - Actualiza tu información

## 📁 Estructura del Proyecto

```
frontend/
├── app/                    # Páginas de Next.js (App Router)
│   ├── login/             # Página de inicio de sesión
│   ├── registro/          # Página de registro
│   ├── perfil/            # Página de perfil de usuario
│   ├── crear-publicacion/ # Página para crear publicaciones
│   └── page.tsx           # Página de inicio (feed)
├── components/            # Componentes React reutilizables
│   ├── Header.tsx         # Header de la aplicación
│   ├── Footer.tsx         # Footer de la aplicación
│   ├── Navigation.tsx     # Navegación por pestañas
│   └── PostCard.tsx       # Tarjeta de publicación
├── context/               # Context API de React
│   └── SocialContext.tsx  # Contexto global de la app
├── lib/                   # Utilidades y servicios
│   ├── config.ts          # Configuración (URLs de API)
│   └── api.ts             # Cliente API para comunicarse con el backend
└── types/                 # Definiciones de TypeScript
    └── index.ts           # Tipos compartidos
```

## 🔐 Autenticación

El frontend maneja la autenticación mediante:

1. **Registro/Login:** Las páginas `/registro` y `/login` envían las credenciales al backend
2. **Token JWT:** El token recibido se guarda en `localStorage` con la clave `auth_token`
3. **Peticiones autenticadas:** El cliente API (`lib/api.ts`) automáticamente incluye el token en el header `Authorization` de todas las peticiones
4. **Verificación:** Al cargar la app, se verifica el token y se carga el usuario actual si es válido

## 🛠️ Tecnologías

- **Next.js 16.1.1** - Framework React con App Router
- **React 19.2.3** - Biblioteca de UI
- **TypeScript 5** - Tipado estático
- **Tailwind CSS 4** - Estilos utilitarios

## 📝 Notas

- El frontend requiere que el backend esté corriendo para funcionar correctamente
- Si el backend no está disponible, verás errores en la consola del navegador
- El token JWT se guarda en `localStorage`, por lo que persiste al recargar la página
- Para cerrar sesión, el botón "Salir" en el header elimina el token y redirige al login

## 🐛 Solución de Problemas

### El frontend no puede conectarse al backend

1. Verifica que el backend esté corriendo: `curl http://localhost:3001/health`
2. Verifica que la variable `NEXT_PUBLIC_API_URL` esté configurada correctamente
3. Revisa la consola del navegador para ver errores de CORS o conexión

### Error 401 (No autorizado)

- Tu token puede haber expirado. Intenta cerrar sesión y volver a iniciar sesión
- Verifica que el token esté guardado en `localStorage`

### Los datos no se cargan

- Asegúrate de estar autenticado
- Verifica que el backend tenga datos en la base de datos
- Revisa la consola del navegador y la terminal del backend para ver errores
