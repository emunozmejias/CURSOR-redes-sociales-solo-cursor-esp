# Guía para Probar la API

## PASO 10: Probar la API

### Prerrequisitos

1. Asegúrate de que todos los servicios estén corriendo:
   ```bash
   cd backend
   npm run dev
   ```

2. Verifica que todos los servicios estén activos:
   ```bash
   curl http://localhost:3001/health  # Gateway
   curl http://localhost:3002/health  # Auth Service
   curl http://localhost:3003/health  # Users Service
   curl http://localhost:3004/health  # Posts Service
   curl http://localhost:3005/health  # Comments Service
   ```

---

## 1. Registro de Usuario

Crea un nuevo usuario en el sistema:

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

**Respuesta esperada:**
```json
{
  "message": "Usuario registrado exitosamente",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "username": "usuario123",
    "name": "Usuario Demo"
  }
}
```

**Guarda el `token` para las siguientes peticiones.**

---

## 2. Login

Autentica un usuario existente:

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "password123"
  }'
```

**Respuesta esperada:**
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "username": "usuario123",
    "name": "Usuario Demo",
    "bio": null,
    "avatar": null
  }
}
```

---

## 3. Verificar Token

Verifica si tu token es válido:

```bash
curl -X GET http://localhost:3001/api/auth/verify \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

Reemplaza `TU_TOKEN_AQUI` con el token recibido en el login o registro.

---

## 4. Obtener Perfil del Usuario

Obtén la información de tu perfil:

```bash
curl -X GET http://localhost:3001/api/users/me \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

---

## 5. Actualizar Perfil

Actualiza tu información de perfil:

```bash
curl -X PUT http://localhost:3001/api/users/me \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Esta es mi nueva biografía",
    "name": "Usuario Actualizado"
  }'
```

---

## 6. Crear Publicación

Crea una nueva publicación:

```bash
curl -X POST http://localhost:3001/api/posts \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Esta es mi primera publicación en la red social! 🎉",
    "images": []
  }'
```

---

## 7. Obtener Feed (Todas las Publicaciones)

Obtén todas las publicaciones:

```bash
curl -X GET "http://localhost:3001/api/posts?page=1&limit=10"
```

---

## 8. Dar Like a una Publicación

Da like o quita like a una publicación:

```bash
curl -X POST http://localhost:3001/api/comments/post/1/like \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

**Respuesta esperada:**
```json
{
  "message": "Like agregado",
  "liked": true,
  "likesCount": 1
}
```

---

## 9. Crear Comentario

Crea un comentario en una publicación:

```bash
curl -X POST http://localhost:3001/api/comments/post/1 \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "¡Excelente publicación!"
  }'
```

---

## 10. Obtener Comentarios de una Publicación

Obtén todos los comentarios de una publicación:

```bash
curl -X GET "http://localhost:3001/api/comments/post/1?page=1&limit=50"
```

---

## Script de Prueba Completo

Puedes usar este script para probar todos los endpoints en secuencia:

```bash
#!/bin/bash

# 1. Registrar usuario
echo "1. Registrando usuario..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "test123",
    "name": "Usuario de Prueba"
  }')

echo "$REGISTER_RESPONSE" | jq '.'

# Extraer token
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token')
echo ""
echo "Token obtenido: ${TOKEN:0:50}..."
echo ""

# 2. Login
echo "2. Haciendo login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }')

echo "$LOGIN_RESPONSE" | jq '.'
echo ""

# 3. Obtener perfil
echo "3. Obteniendo perfil..."
curl -s -X GET http://localhost:3001/api/users/me \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# 4. Crear publicación
echo "4. Creando publicación..."
POST_RESPONSE=$(curl -s -X POST http://localhost:3001/api/posts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Mi primera publicación de prueba!",
    "images": []
  }')

POST_ID=$(echo "$POST_RESPONSE" | jq -r '.post.id')
echo "$POST_RESPONSE" | jq '.'
echo ""

# 5. Obtener feed
echo "5. Obteniendo feed..."
curl -s -X GET "http://localhost:3001/api/posts?page=1&limit=10" | jq '.'
echo ""

# 6. Dar like
echo "6. Dando like a la publicación..."
curl -s -X POST "http://localhost:3001/api/comments/post/$POST_ID/like" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# 7. Crear comentario
echo "7. Creando comentario..."
curl -s -X POST "http://localhost:3001/api/comments/post/$POST_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "¡Me encanta esta publicación!"
  }' | jq '.'
echo ""

echo "✅ Todas las pruebas completadas!"
```

---

## Herramientas Recomendadas

### 1. cURL (línea de comandos)
Ya incluido en macOS/Linux.

### 2. Postman
Descarga desde: https://www.postman.com/downloads/

### 3. Insomnia
Descarga desde: https://insomnia.rest/download

### 4. HTTPie
```bash
brew install httpie
```

Ejemplo con HTTPie:
```bash
http POST localhost:3001/api/auth/register \
  email=test@example.com \
  username=testuser \
  password=test123 \
  name="Usuario Test"
```

---

## Códigos de Estado HTTP

- `200 OK` - Petición exitosa
- `201 Created` - Recurso creado exitosamente
- `400 Bad Request` - Error en los datos enviados
- `401 Unauthorized` - Token faltante o inválido
- `403 Forbidden` - No tienes permiso para esta acción
- `404 Not Found` - Recurso no encontrado
- `500 Internal Server Error` - Error del servidor

---

## Notas

- Todas las peticiones que requieren autenticación deben incluir el header: `Authorization: Bearer TU_TOKEN`
- El token JWT tiene una validez de 7 días por defecto (configurable en `.env`)
- Los servicios deben estar corriendo antes de probar los endpoints
- El API Gateway está en el puerto 3001 y enruta a todos los microservicios

---

## Troubleshooting

### Error: "Cannot connect to server"
- Verifica que todos los servicios estén corriendo: `npm run dev`
- Verifica los puertos: 3001-3005

### Error: "Token inválido o expirado"
- Vuelve a hacer login para obtener un nuevo token
- Verifica que estés usando el formato correcto: `Bearer TU_TOKEN`

### Error: "Servicio no disponible"
- Verifica que el microservicio específico esté corriendo
- Revisa los logs en la consola donde ejecutaste `npm run dev`
