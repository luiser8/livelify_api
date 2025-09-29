#!/bin/bash

# 🔒 Test Script: Un Solo Token Por Usuario
# Este script verifica que cada usuario tenga máximo un token activo

BASE_URL="http://localhost:3000/api/v1"
RESET='\033[0m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'

echo -e "${BOLD}🔒 TEST: Un Solo Token Por Usuario${RESET}"
echo -e "${BLUE}=====================================${RESET}"
echo ""

# Función para crear un usuario de prueba
create_test_user() {
    echo -e "${YELLOW}📝 Creando usuario de prueba...${RESET}"
    
    REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/users/register" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "testuser@example.com",
        "password": "SecurePass123!",
        "firstName": "Test",
        "lastName": "User",
        "address": "123 Test St",
        "phone": "+1234567890"
      }')
    
    if echo "$REGISTER_RESPONSE" | jq -e '.id' > /dev/null; then
        echo -e "${GREEN}✅ Usuario de prueba creado${RESET}"
        return 0
    else
        echo -e "${YELLOW}ℹ️  Usuario ya existe o error en creación${RESET}"
        return 0
    fi
}

# Función para hacer login
do_login() {
    local session_name=$1
    echo -e "${YELLOW}📝 Login - Sesión $session_name${RESET}"
    
    LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "testuser@example.com", 
        "password": "SecurePass123!"
      }')
    
    local ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')
    local REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.refresh_token')
    
    if [ "$ACCESS_TOKEN" != "null" ] && [ -n "$ACCESS_TOKEN" ]; then
        echo -e "${GREEN}✅ Login exitoso - Sesión $session_name${RESET}"
        echo "   Access Token: ${ACCESS_TOKEN:0:30}..."
        echo "   Refresh Token: ${REFRESH_TOKEN:0:30}..."
        
        # Exportar tokens para uso global
        if [ "$session_name" = "1" ]; then
            export ACCESS_TOKEN_1="$ACCESS_TOKEN"
            export REFRESH_TOKEN_1="$REFRESH_TOKEN"
        elif [ "$session_name" = "2" ]; then
            export ACCESS_TOKEN_2="$ACCESS_TOKEN"
            export REFRESH_TOKEN_2="$REFRESH_TOKEN"
        fi
        
        return 0
    else
        echo -e "${RED}❌ Login falló - Sesión $session_name${RESET}"
        return 1
    fi
}

# Función para probar acceso a endpoint protegido
test_access() {
    local token=$1
    local session_name=$2
    
    echo -e "${YELLOW}🔍 Probando acceso con token de Sesión $session_name${RESET}"
    
    RESPONSE=$(curl -s -X GET "$BASE_URL/users/me" \
      -H "Authorization: Bearer $token")
    
    if echo "$RESPONSE" | jq -e '.id' > /dev/null; then
        echo -e "${GREEN}✅ Acceso exitoso con token de Sesión $session_name${RESET}"
        return 0
    else
        echo -e "${RED}❌ Acceso denegado con token de Sesión $session_name${RESET}"
        echo "   Error: $(echo "$RESPONSE" | jq -r '.message // "Error desconocido"')"
        return 1
    fi
}

# Ejecutar tests
echo -e "${BOLD}Test 1: Crear usuario de prueba${RESET}"
create_test_user
echo ""

echo -e "${BOLD}Test 2: Primera sesión de login${RESET}"
if do_login "1"; then
    echo ""
    
    echo -e "${BOLD}Test 3: Verificar acceso con primer token${RESET}"
    test_access "$ACCESS_TOKEN_1" "1"
    echo ""
    
    echo -e "${BOLD}Test 4: Segunda sesión de login (debería invalidar la primera)${RESET}"
    if do_login "2"; then
        echo ""
        
        echo -e "${BOLD}Test 5: Verificar que el primer token YA NO funciona${RESET}"
        if test_access "$ACCESS_TOKEN_1" "1"; then
            echo -e "${RED}❌ FALLO DE SEGURIDAD: Token anterior sigue funcionando${RESET}"
            echo -e "${RED}   El sistema debería tener UN SOLO token por usuario${RESET}"
        else
            echo -e "${GREEN}🔒 ✅ CORRECTO: Token anterior fue invalidado${RESET}"
        fi
        echo ""
        
        echo -e "${BOLD}Test 6: Verificar que el segundo token SÍ funciona${RESET}"
        if test_access "$ACCESS_TOKEN_2" "2"; then
            echo -e "${GREEN}✅ CORRECTO: Nuevo token funciona correctamente${RESET}"
        else
            echo -e "${RED}❌ ERROR: Nuevo token no funciona${RESET}"
        fi
        echo ""
        
        echo -e "${BOLD}Test 7: Logout y verificar invalidación${RESET}"
        LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/logout" \
          -H "Authorization: Bearer $ACCESS_TOKEN_2")
        
        if echo "$LOGOUT_RESPONSE" | jq -e '.success' > /dev/null; then
            echo -e "${GREEN}✅ Logout exitoso${RESET}"
            
            echo -e "${YELLOW}🔍 Verificando que el token fue invalidado...${RESET}"
            if test_access "$ACCESS_TOKEN_2" "2"; then
                echo -e "${RED}❌ FALLO: Token sigue funcionando después de logout${RESET}"
            else
                echo -e "${GREEN}🔒 ✅ CORRECTO: Token invalidado después de logout${RESET}"
            fi
        else
            echo -e "${RED}❌ Logout falló${RESET}"
        fi
    fi
fi

echo ""
echo -e "${BLUE}=====================================${RESET}"
echo -e "${BOLD}📊 RESUMEN DE COMPORTAMIENTO ESPERADO:${RESET}"
echo -e "${GREEN}✅ Solo un token activo por usuario en cualquier momento${RESET}"
echo -e "${GREEN}✅ Login nuevo invalida token anterior automáticamente${RESET}"
echo -e "${GREEN}✅ Logout invalida el token actual${RESET}"
echo -e "${GREEN}✅ Tokens invalidados no pueden acceder a endpoints protegidos${RESET}"
echo ""
echo -e "${BOLD}🎯 Si todos los tests pasan, el sistema funciona correctamente!${RESET}"
