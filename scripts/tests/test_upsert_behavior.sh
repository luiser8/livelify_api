#!/bin/bash

# 🔄 Test Script: Comportamiento UPSERT de UserToken
# Verifica que el sistema CREATE nuevo token o UPDATE existente correctamente

BASE_URL="http://localhost:3000/api/v1"
RESET='\033[0m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
PURPLE='\033[0;35m'

echo -e "${BOLD}🔄 TEST: Comportamiento UPSERT de UserToken${RESET}"
echo -e "${BLUE}=============================================${RESET}"
echo ""

# Función para extraer solo los últimos 8 caracteres de un token para identificación
get_token_id() {
    echo "$1" | tail -c 9
}

# Función para crear un usuario de prueba único
create_unique_test_user() {
    local timestamp=$(date +%s)
    local test_email="upserttest${timestamp}@example.com"
    
    echo -e "${YELLOW}📝 Creando usuario único para test: $test_email${RESET}"
    
    REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/users/register" \
      -H "Content-Type: application/json" \
      -d "{
        \"email\": \"$test_email\",
        \"password\": \"SecurePass123!\",
        \"firstName\": \"Upsert\",
        \"lastName\": \"Test\",
        \"address\": \"123 Test St\",
        \"phone\": \"+1234567890\"
      }")
    
    if echo "$REGISTER_RESPONSE" | jq -e '.id' > /dev/null; then
        echo -e "${GREEN}✅ Usuario único creado: $test_email${RESET}"
        export TEST_EMAIL="$test_email"
        return 0
    else
        echo -e "${RED}❌ Error creando usuario único${RESET}"
        echo "$REGISTER_RESPONSE"
        return 1
    fi
}

# Función para hacer login y obtener tokens
do_login() {
    local session_name=$1
    echo -e "${PURPLE}🔑 LOGIN $session_name - Email: $TEST_EMAIL${RESET}"
    
    LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
      -H "Content-Type: application/json" \
      -d "{
        \"email\": \"$TEST_EMAIL\", 
        \"password\": \"SecurePass123!\"
      }")
    
    local ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')
    local REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.refresh_token')
    
    if [ "$ACCESS_TOKEN" != "null" ] && [ -n "$ACCESS_TOKEN" ]; then
        local TOKEN_ID=$(get_token_id "$ACCESS_TOKEN")
        echo -e "${GREEN}✅ Login exitoso - Sesión $session_name${RESET}"
        echo -e "   🔑 Access Token ID: ...${TOKEN_ID}"
        echo -e "   🔄 Refresh Token ID: ...$(get_token_id "$REFRESH_TOKEN")"
        
        # Exportar tokens según la sesión
        if [ "$session_name" = "1" ]; then
            export ACCESS_TOKEN_1="$ACCESS_TOKEN"
            export REFRESH_TOKEN_1="$REFRESH_TOKEN"
            export TOKEN_ID_1="$TOKEN_ID"
        elif [ "$session_name" = "2" ]; then
            export ACCESS_TOKEN_2="$ACCESS_TOKEN"
            export REFRESH_TOKEN_2="$REFRESH_TOKEN"
            export TOKEN_ID_2="$TOKEN_ID"
        elif [ "$session_name" = "3" ]; then
            export ACCESS_TOKEN_3="$ACCESS_TOKEN"
            export REFRESH_TOKEN_3="$REFRESH_TOKEN"
            export TOKEN_ID_3="$TOKEN_ID"
        fi
        
        return 0
    else
        echo -e "${RED}❌ Login falló - Sesión $session_name${RESET}"
        echo "Response: $LOGIN_RESPONSE"
        return 1
    fi
}

# Función para verificar si un token funciona
test_token_works() {
    local token=$1
    local token_name=$2
    
    RESPONSE=$(curl -s -X GET "$BASE_URL/users/me" \
      -H "Authorization: Bearer $token")
    
    if echo "$RESPONSE" | jq -e '.id' > /dev/null; then
        echo -e "${GREEN}✅ Token $token_name FUNCIONA${RESET}"
        return 0
    else
        echo -e "${RED}❌ Token $token_name NO FUNCIONA${RESET}"
        local error_msg=$(echo "$RESPONSE" | jq -r '.message // "Error desconocido"')
        echo -e "   Error: $error_msg"
        return 1
    fi
}

# Función para simular una pausa con indicador visual
pause_with_indicator() {
    local seconds=$1
    local message=$2
    echo -e "${YELLOW}⏱️  $message (esperando ${seconds}s)${RESET}"
    for i in $(seq $seconds -1 1); do
        echo -ne "\r   ⏳ $i segundos restantes..."
        sleep 1
    done
    echo -e "\r   ✅ Continuando...                     "
}

# ====================================
# EJECUTAR TESTS
# ====================================

echo -e "${BOLD}🎯 Test 1: Crear usuario único para test${RESET}"
if ! create_unique_test_user; then
    echo -e "${RED}❌ No se pudo crear usuario. Abortando test.${RESET}"
    exit 1
fi
echo ""

echo -e "${BOLD}🎯 Test 2: Primer LOGIN (debería CREAR nuevo registro)${RESET}"
echo -e "${BLUE}   Expectativa: Como no existe registro previo, se debe CREAR${RESET}"
if do_login "1"; then
    echo -e "${GREEN}📊 Estado: PRIMER token creado en base de datos${RESET}"
    echo ""
    
    echo -e "${BOLD}🎯 Test 3: Verificar que el primer token funciona${RESET}"
    test_token_works "$ACCESS_TOKEN_1" "1 (...$TOKEN_ID_1)"
    echo ""
    
    pause_with_indicator 2 "Preparando segundo login"
    
    echo -e "${BOLD}🎯 Test 4: Segundo LOGIN (debería REEMPLAZAR registro existente)${RESET}"
    echo -e "${BLUE}   Expectativa: Como YA existe registro, se debe UPDATE/REEMPLAZAR${RESET}"
    if do_login "2"; then
        echo -e "${GREEN}📊 Estado: SEGUNDO token debería haber reemplazado al primero${RESET}"
        echo ""
        
        echo -e "${BOLD}🎯 Test 5: Verificar tokens después del segundo login${RESET}"
        
        # Verificar que el primer token YA NO funciona
        echo -e "${PURPLE}   Probando TOKEN 1 (...$TOKEN_ID_1) - Debería fallar:${RESET}"
        if test_token_works "$ACCESS_TOKEN_1" "1 (...$TOKEN_ID_1)"; then
            echo -e "${RED}🚨 PROBLEMA: Token anterior SIGUE funcionando (no fue reemplazado)${RESET}"
        else
            echo -e "${GREEN}✅ CORRECTO: Token anterior fue reemplazado/invalidado${RESET}"
        fi
        echo ""
        
        # Verificar que el segundo token SÍ funciona
        echo -e "${PURPLE}   Probando TOKEN 2 (...$TOKEN_ID_2) - Debería funcionar:${RESET}"
        if test_token_works "$ACCESS_TOKEN_2" "2 (...$TOKEN_ID_2)"; then
            echo -e "${GREEN}✅ CORRECTO: Nuevo token funciona correctamente${RESET}"
        else
            echo -e "${RED}🚨 PROBLEMA: Nuevo token no funciona${RESET}"
        fi
        echo ""
        
        pause_with_indicator 2 "Preparando tercer login"
        
        echo -e "${BOLD}🎯 Test 6: Tercer LOGIN (otra vez debería REEMPLAZAR)${RESET}"
        echo -e "${BLUE}   Expectativa: Reemplazar TOKEN 2 con TOKEN 3${RESET}"
        if do_login "3"; then
            echo -e "${GREEN}📊 Estado: TERCER token debería haber reemplazado al segundo${RESET}"
            echo ""
            
            echo -e "${BOLD}🎯 Test 7: Verificación final de todos los tokens${RESET}"
            
            echo -e "${PURPLE}   Probando TOKEN 1 (...$TOKEN_ID_1) - Debería fallar:${RESET}"
            test_token_works "$ACCESS_TOKEN_1" "1 (...$TOKEN_ID_1)"
            
            echo -e "${PURPLE}   Probando TOKEN 2 (...$TOKEN_ID_2) - Debería fallar:${RESET}"
            test_token_works "$ACCESS_TOKEN_2" "2 (...$TOKEN_ID_2)"
            
            echo -e "${PURPLE}   Probando TOKEN 3 (...$TOKEN_ID_3) - Debería funcionar:${RESET}"
            test_token_works "$ACCESS_TOKEN_3" "3 (...$TOKEN_ID_3)"
            
        fi
    fi
fi

echo ""
echo -e "${BLUE}=============================================${RESET}"
echo -e "${BOLD}📊 RESUMEN DEL COMPORTAMIENTO UPSERT:${RESET}"
echo ""
echo -e "${GREEN}✅ CREAR (First Login):${RESET}"
echo -e "   - Usuario sin registro previo en UserToken"
echo -e "   - Sistema ejecuta CREATE en el upsert"
echo -e "   - Nuevo registro creado en base de datos"
echo ""
echo -e "${GREEN}✅ REEMPLAZAR (Subsequent Logins):${RESET}"
echo -e "   - Usuario con registro existente en UserToken"
echo -e "   - Sistema ejecuta UPDATE en el upsert"
echo -e "   - Token anterior invalidado automáticamente"
echo -e "   - Solo el último token permanece activo"
echo ""
echo -e "${BOLD}🎯 Si todos los tests pasan:${RESET}"
echo -e "${GREEN}   ✅ UPSERT funciona correctamente${RESET}"
echo -e "${GREEN}   ✅ Primer login CREA registro${RESET}"
echo -e "${GREEN}   ✅ Logins posteriores REEMPLAZAN registro${RESET}"
echo -e "${GREEN}   ✅ Solo un token activo por usuario en todo momento${RESET}"
