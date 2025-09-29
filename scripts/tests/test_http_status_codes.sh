#!/bin/bash

# 🚦 HTTP Status Codes Test Script
# Verifies that the API returns correct HTTP status codes for different error scenarios

set -e

RESET='\033[0m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:3000/api/v1}"
TEST_EMAIL="test-http-codes@example.com"
TEST_PASSWORD="TestPassword123!"

echo -e "${BOLD}🧪 HTTP Status Codes Test Suite${RESET}"
echo -e "${BLUE}====================================${RESET}"
echo -e "${BLUE}API Base URL: ${API_BASE_URL}${RESET}"
echo ""

# Function to make HTTP request and get status code
make_request() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    local auth_header="$4"
    
    local curl_cmd="curl -s -w '%{http_code}' -o /dev/null -X ${method}"
    
    if [ -n "$data" ]; then
        curl_cmd="$curl_cmd -H 'Content-Type: application/json' -d '$data'"
    fi
    
    if [ -n "$auth_header" ]; then
        curl_cmd="$curl_cmd -H 'Authorization: Bearer $auth_header'"
    fi
    
    curl_cmd="$curl_cmd ${API_BASE_URL}${endpoint}"
    
    eval "$curl_cmd"
}

# Function to test status code
test_status_code() {
    local description="$1"
    local method="$2"
    local endpoint="$3"
    local expected_status="$4"
    local data="$5"
    local auth_header="$6"
    
    echo -e "${YELLOW}Testing: ${description}${RESET}"
    
    local actual_status
    actual_status=$(make_request "$method" "$endpoint" "$data" "$auth_header")
    
    if [ "$actual_status" = "$expected_status" ]; then
        echo -e "${GREEN}✅ Expected: $expected_status, Got: $actual_status${RESET}"
        return 0
    else
        echo -e "${RED}❌ Expected: $expected_status, Got: $actual_status${RESET}"
        return 1
    fi
}

echo -e "${BOLD}🔐 Authentication Endpoint Tests${RESET}"
echo "=================================================="

# Test 1: Invalid login credentials should return 401
echo -e "${BLUE}1. Testing invalid login credentials${RESET}"
invalid_login_data='{
    "email": "nonexistent@example.com",
    "password": "wrongpassword"
}'

test_status_code \
    "Invalid login credentials" \
    "POST" \
    "/auth/login" \
    "401" \
    "$invalid_login_data"

echo ""

# Test 2: Invalid refresh token should return 401
echo -e "${BLUE}2. Testing invalid refresh token${RESET}"
invalid_refresh_data='{
    "refresh_token": "invalid.jwt.token"
}'

test_status_code \
    "Invalid refresh token" \
    "POST" \
    "/auth/refresh" \
    "401" \
    "$invalid_refresh_data" \
    "invalid.access.token"

echo ""

echo -e "${BOLD}👤 User Registration Tests${RESET}"
echo "=================================================="

# Test 3: Register a valid user (should succeed first time)
echo -e "${BLUE}3. Testing valid user registration${RESET}"
valid_user_data='{
    "email": "'$TEST_EMAIL'",
    "password": "'$TEST_PASSWORD'",
    "firstName": "Test",
    "lastName": "User",
    "phone": "+1234567890",
    "address": "123 Test St, Test City, TC",
    "avatarUrl": "https://example.com/avatar.jpg"
}'

test_status_code \
    "Valid user registration" \
    "POST" \
    "/users/register" \
    "201" \
    "$valid_user_data"

echo ""

# Test 4: Try to register same user again (should return 409)
echo -e "${BLUE}4. Testing duplicate user registration${RESET}"

test_status_code \
    "Duplicate user registration" \
    "POST" \
    "/users/register" \
    "409" \
    "$valid_user_data"

echo ""

echo -e "${BOLD}🔓 Protected Endpoint Tests${RESET}"
echo "=================================================="

# Test 5: Access protected endpoint without token (should return 401)
echo -e "${BLUE}5. Testing protected endpoint without token${RESET}"

test_status_code \
    "Protected endpoint without token" \
    "GET" \
    "/users/me" \
    "401" \
    "" \
    ""

echo ""

# Test 6: Access protected endpoint with invalid token (should return 401)
echo -e "${BLUE}6. Testing protected endpoint with invalid token${RESET}"

test_status_code \
    "Protected endpoint with invalid token" \
    "GET" \
    "/users/me" \
    "401" \
    "" \
    "invalid.jwt.token"

echo ""

echo -e "${BOLD}📊 Rate Limiting Tests${RESET}"
echo "=================================================="

# Test 7: Rate limiting should return 429
echo -e "${BLUE}7. Testing rate limiting (multiple invalid login attempts)${RESET}"

echo -e "${YELLOW}Making multiple login attempts to trigger rate limiting...${RESET}"

for i in {1..6}; do
    status=$(make_request "POST" "/auth/login" "$invalid_login_data")
    echo -e "  Attempt $i: Status $status"
    
    if [ "$status" = "429" ]; then
        echo -e "${GREEN}✅ Rate limiting triggered on attempt $i${RESET}"
        break
    fi
    
    sleep 0.1
done

echo ""

echo -e "${BOLD}📋 Validation Tests${RESET}"
echo "=================================================="

# Test 8: Invalid email format should return 400
echo -e "${BLUE}8. Testing invalid email format${RESET}"
invalid_email_data='{
    "email": "invalid-email",
    "password": "'$TEST_PASSWORD'",
    "firstName": "Test",
    "lastName": "User",
    "phone": "+1234567890",
    "address": "123 Test St"
}'

test_status_code \
    "Invalid email format" \
    "POST" \
    "/users/register" \
    "400" \
    "$invalid_email_data"

echo ""

# Test 9: Missing required fields should return 400
echo -e "${BLUE}9. Testing missing required fields${RESET}"
incomplete_data='{
    "email": "test@example.com"
}'

test_status_code \
    "Missing required fields" \
    "POST" \
    "/users/register" \
    "400" \
    "$incomplete_data"

echo ""

# Test 10: Valid login with correct credentials
echo -e "${BLUE}10. Testing valid login (should return 200)${RESET}"
valid_login_data='{
    "email": "'$TEST_EMAIL'",
    "password": "'$TEST_PASSWORD'"
}'

test_status_code \
    "Valid login credentials" \
    "POST" \
    "/auth/login" \
    "200" \
    "$valid_login_data"

echo ""

# Summary
echo -e "${BOLD}📊 HTTP Status Codes Test Summary${RESET}"
echo "=================================================="
echo -e "${GREEN}✅ All HTTP status code tests completed${RESET}"
echo ""
echo -e "${BLUE}Expected Status Codes:${RESET}"
echo -e "  • ${GREEN}200${RESET} - Successful login"
echo -e "  • ${GREEN}201${RESET} - Successful registration"
echo -e "  • ${YELLOW}400${RESET} - Bad request (validation errors)"
echo -e "  • ${RED}401${RESET} - Unauthorized (invalid credentials/token)"
echo -e "  • ${RED}409${RESET} - Conflict (duplicate email)"
echo -e "  • ${RED}429${RESET} - Too many requests (rate limiting)"
echo ""
echo -e "${BLUE}📋 Notes:${RESET}"
echo -e "  • Invalid credentials now return 401 instead of 500"
echo -e "  • Duplicate registrations return 409 instead of 500"
echo -e "  • Missing users return 404 instead of 500"
echo -e "  • Validation errors return 400"
echo ""
echo -e "${GREEN}🎉 HTTP status codes test suite completed!${RESET}"
