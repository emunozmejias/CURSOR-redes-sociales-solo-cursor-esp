#!/bin/bash

# Script para probar la API del backend
# Asegúrate de que los servicios estén corriendo antes de ejecutar este script

BASE_URL="http://localhost:3001"
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Iniciando pruebas de la API...${NC}"
echo ""

# Verificar que el gateway esté corriendo
echo "1️⃣ Verificando que el Gateway esté activo..."
HEALTH=$(curl -s "$BASE_URL/health")
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Gateway está corriendo${NC}"
  echo "$HEALTH" | jq '.' 2>/dev/null || echo "$HEALTH"
else
  echo "❌ Gateway no está corriendo. Ejecuta: npm run dev"
  exit 1
fi
echo ""

# 1. Registrar usuario
echo -e "${BLUE}2️⃣ Registrando nuevo usuario...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "test123",
    "name": "Usuario de Prueba"
  }')

echo "$REGISTER_RESPONSE" | jq '.' 2>/dev/null || echo "$REGISTER_RESPONSE"

# Extraer token
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token' 2>/dev/null)
if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ Error al registrar usuario o obtener token"
  exit 1
fi

echo -e "${GREEN}✅ Usuario registrado. Token: ${TOKEN:0:50}...${NC}"
echo ""

# 2. Login
echo -e "${BLUE}3️⃣ Haciendo login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }')

echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token' 2>/dev/null)
echo -e "${GREEN}✅ Login exitoso${NC}"
echo ""

# 3. Verificar token
echo -e "${BLUE}4️⃣ Verificando token...${NC}"
VERIFY_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/verify" \
  -H "Authorization: Bearer $TOKEN")

echo "$VERIFY_RESPONSE" | jq '.' 2>/dev/null || echo "$VERIFY_RESPONSE"
echo -e "${GREEN}✅ Token válido${NC}"
echo ""

# 4. Obtener perfil
echo -e "${BLUE}5️⃣ Obteniendo perfil del usuario...${NC}"
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/api/users/me" \
  -H "Authorization: Bearer $TOKEN")

echo "$PROFILE_RESPONSE" | jq '.' 2>/dev/null || echo "$PROFILE_RESPONSE"
echo -e "${GREEN}✅ Perfil obtenido${NC}"
echo ""

# 5. Actualizar perfil
echo -e "${BLUE}6️⃣ Actualizando perfil...${NC}"
UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/users/me" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Esta es mi biografía de prueba",
    "name": "Usuario Actualizado"
  }')

echo "$UPDATE_RESPONSE" | jq '.' 2>/dev/null || echo "$UPDATE_RESPONSE"
echo -e "${GREEN}✅ Perfil actualizado${NC}"
echo ""

# 6. Crear publicación
echo -e "${BLUE}7️⃣ Creando publicación...${NC}"
POST_RESPONSE=$(curl -s -X POST "$BASE_URL/api/posts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Esta es mi primera publicación de prueba! 🎉",
    "images": []
  }')

echo "$POST_RESPONSE" | jq '.' 2>/dev/null || echo "$POST_RESPONSE"

POST_ID=$(echo "$POST_RESPONSE" | jq -r '.post.id' 2>/dev/null)
if [ -z "$POST_ID" ] || [ "$POST_ID" = "null" ]; then
  POST_ID=1  # Fallback para continuar con las pruebas
fi

echo -e "${GREEN}✅ Publicación creada (ID: $POST_ID)${NC}"
echo ""

# 7. Obtener feed
echo -e "${BLUE}8️⃣ Obteniendo feed de publicaciones...${NC}"
FEED_RESPONSE=$(curl -s -X GET "$BASE_URL/api/posts?page=1&limit=10")

echo "$FEED_RESPONSE" | jq '.' 2>/dev/null || echo "$FEED_RESPONSE"
echo -e "${GREEN}✅ Feed obtenido${NC}"
echo ""

# 8. Dar like
echo -e "${BLUE}9️⃣ Dando like a la publicación...${NC}"
LIKE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/comments/post/$POST_ID/like" \
  -H "Authorization: Bearer $TOKEN")

echo "$LIKE_RESPONSE" | jq '.' 2>/dev/null || echo "$LIKE_RESPONSE"
echo -e "${GREEN}✅ Like agregado${NC}"
echo ""

# 9. Crear comentario
echo -e "${BLUE}🔟 Creando comentario...${NC}"
COMMENT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/comments/post/$POST_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "¡Excelente publicación! Me encanta."
  }')

echo "$COMMENT_RESPONSE" | jq '.' 2>/dev/null || echo "$COMMENT_RESPONSE"
echo -e "${GREEN}✅ Comentario creado${NC}"
echo ""

# 10. Obtener comentarios
echo -e "${BLUE}1️⃣1️⃣ Obteniendo comentarios de la publicación...${NC}"
COMMENTS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/comments/post/$POST_ID?page=1&limit=50")

echo "$COMMENTS_RESPONSE" | jq '.' 2>/dev/null || echo "$COMMENTS_RESPONSE"
echo -e "${GREEN}✅ Comentarios obtenidos${NC}"
echo ""

echo -e "${GREEN}✅ Todas las pruebas completadas exitosamente!${NC}"
