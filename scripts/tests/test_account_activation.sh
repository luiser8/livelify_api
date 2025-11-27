#!/bin/bash

# Script de prueba para el sistema de activación de cuenta
# Usage: ./test_account_activation.sh

BASE_URL="http://localhost:3000"
EMAIL="test_$(date +%s)@example.com"  # Email único por ejecución
PASSWORD="SecurePassword123!"

echo "🚀 Testing Account Activation Flow"
echo "=================================="
echo ""

# 1. Registrar usuario
echo "1️⃣  Registering user with email: $EMAIL"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/users/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"firstName\": \"John\",
    \"lastName\": \"Doe\",
    \"address\": \"123 Main St\",
    \"phone\": \"+1234567890\",
    \"acceptTermsAndPolicies\": true
  }")

echo "✅ User registered"
echo "$REGISTER_RESPONSE" | jq '.'
echo ""

# Extraer userId para consultar la base de datos
USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.id')
echo "User ID: $USER_ID"
echo ""

# 2. Intentar login ANTES de activar (debe fallar)
echo "2️⃣  Attempting login BEFORE activation (should fail)"
LOGIN_BEFORE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

echo "Response:"
echo "$LOGIN_BEFORE" | jq '.'
echo ""

# 3. Mostrar instrucciones para obtener el hash
echo "3️⃣  To get the activation hash, run this SQL query:"
echo ""
echo "SELECT * FROM \"UserRecovery\" WHERE \"userId\" = '$USER_ID' AND type = 'REGISTER';"
echo ""
echo "Or if you have psql installed:"
echo "docker-compose exec postgres psql -U your_user -d your_db -c \"SELECT * FROM \\\"UserRecovery\\\" WHERE \\\"userId\\\" = '$USER_ID' AND type = 'REGISTER';\""
echo ""

# 4. Pedir el hash al usuario
read -p "4️⃣  Paste the activation hash here (or 'q' to quit): " HASH

if [ "$HASH" = "q" ]; then
    echo "❌ Test cancelled"
    exit 0
fi

# 5. Activar cuenta
echo ""
echo "5️⃣  Activating account with hash: $HASH"
ACTIVATE_RESPONSE=$(curl -s -X POST "$BASE_URL/users/activate" \
  -H "Content-Type: application/json" \
  -d "{
    \"hash\": \"$HASH\"
  }")

echo "✅ Activation response:"
echo "$ACTIVATE_RESPONSE" | jq '.'
echo ""

# 6. Verificar estado
SUCCESS=$(echo "$ACTIVATE_RESPONSE" | jq -r '.success')
if [ "$SUCCESS" = "true" ]; then
    echo "✅ Account activated successfully!"
    echo ""
    echo "6️⃣  Verify the hash was deactivated:"
    echo "SELECT * FROM \"UserRecovery\" WHERE \"userId\" = '$USER_ID' AND type = 'REGISTER';"
    echo ""
    
    # 7. Intentar login DESPUÉS de activar (debe funcionar)
    echo "7️⃣  Attempting login AFTER activation (should succeed)"
    LOGIN_AFTER=$(curl -s -X POST "$BASE_URL/auth/login" \
      -H "Content-Type: application/json" \
      -d "{
        \"email\": \"$EMAIL\",
        \"password\": \"$PASSWORD\"
      }")
    
    echo "✅ Login response:"
    echo "$LOGIN_AFTER" | jq '.'
    
    # Verificar si el login fue exitoso
    ACCESS_TOKEN=$(echo "$LOGIN_AFTER" | jq -r '.access_token')
    if [ "$ACCESS_TOKEN" != "null" ] && [ ! -z "$ACCESS_TOKEN" ]; then
        echo ""
        echo "🎉 SUCCESS! User can now login after activation"
    else
        echo ""
        echo "❌ Login failed after activation. Check the error message above."
    fi
else
    echo "❌ Activation failed"
    echo "Message: $(echo "$ACTIVATE_RESPONSE" | jq -r '.message')"
fi

echo ""
echo "=================================="
echo "🎉 Test completed"

