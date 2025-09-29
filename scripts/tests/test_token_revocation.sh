#!/bin/bash

# 🔒 Test Script: Token Revocation Security Fix
# Este script demuestra que los tokens se revocan correctamente después del logout

BASE_URL="http://localhost:3000/api/v1"
RESET='\033[0m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'

echo -e "${BOLD}🔒 SECURITY TEST: Token Revocation After Logout${RESET}"
echo -e "${BLUE}================================================${RESET}"
echo ""

# Step 1: Login
echo -e "${YELLOW}📝 Step 1: Login to get access token${RESET}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com", 
    "password": "SecurePass123!"
  }')

echo "Login Response:"
echo "$LOGIN_RESPONSE" | jq .
echo ""

# Extract access token
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')

if [ "$ACCESS_TOKEN" = "null" ] || [ -z "$ACCESS_TOKEN" ]; then
    echo -e "${RED}❌ Failed to get access token. Make sure user exists and server is running.${RESET}"
    exit 1
fi

echo -e "${GREEN}✅ Access token obtained: ${ACCESS_TOKEN:0:50}...${RESET}"
echo ""

# Step 2: Test access with token (should work)
echo -e "${YELLOW}📝 Step 2: Access protected endpoint with valid token${RESET}"
BEFORE_LOGOUT=$(curl -s -X GET "$BASE_URL/users/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Response before logout:"
echo "$BEFORE_LOGOUT" | jq .
echo ""

if echo "$BEFORE_LOGOUT" | jq -e '.id' > /dev/null; then
    echo -e "${GREEN}✅ Access successful before logout${RESET}"
else
    echo -e "${RED}❌ Access failed before logout - check token${RESET}"
    exit 1
fi
echo ""

# Step 3: Logout (should revoke token)
echo -e "${YELLOW}📝 Step 3: Logout (this should revoke the token)${RESET}"
LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/logout" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Logout Response:"
echo "$LOGOUT_RESPONSE" | jq .
echo ""

if echo "$LOGOUT_RESPONSE" | jq -e '.success' > /dev/null; then
    echo -e "${GREEN}✅ Logout successful${RESET}"
else
    echo -e "${RED}❌ Logout failed${RESET}"
    exit 1
fi
echo ""

# Step 4: Try to access again with same token (should fail)
echo -e "${YELLOW}📝 Step 4: Try to access protected endpoint with revoked token${RESET}"
echo -e "${BLUE}🔒 This should fail with 401 Unauthorized${RESET}"
AFTER_LOGOUT=$(curl -s -X GET "$BASE_URL/users/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Response after logout:"
echo "$AFTER_LOGOUT" | jq .
echo ""

# Check if access was properly denied
if echo "$AFTER_LOGOUT" | jq -e '.statusCode' | grep -q "401"; then
    echo -e "${GREEN}🔒 ✅ SECURITY FIX SUCCESSFUL!${RESET}"
    echo -e "${GREEN}   Token was properly revoked after logout${RESET}"
    echo -e "${GREEN}   Access denied: $(echo "$AFTER_LOGOUT" | jq -r '.message')${RESET}"
    echo ""
    echo -e "${BOLD}🎯 RESULTADO: Fix de seguridad funcionando correctamente${RESET}"
    echo -e "${GREEN}   ✅ Logout realmente revoca los tokens${RESET}"
    echo -e "${GREEN}   ✅ Tokens revocados no pueden acceder a endpoints protegidos${RESET}"
else
    echo -e "${RED}❌ SECURITY VULNERABILITY STILL EXISTS!${RESET}"
    echo -e "${RED}   Token still works after logout${RESET}"
    echo -e "${RED}   Access granted when it should be denied${RESET}"
    exit 1
fi

echo ""
echo -e "${BLUE}================================================${RESET}"
echo -e "${BOLD}✅ Security test completed successfully!${RESET}"
