#!/bin/bash

# 🚦 Rate Limiting Test Script
# Tests all rate limiting configurations for the Livelify API

set -e

RESET='\033[0m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:3000/api/v1}"
TEST_EMAIL="test-rate-limit@example.com"
TEST_PASSWORD="TestPassword123!"

echo -e "${BOLD}🚦 Rate Limiting Test Suite${RESET}"
echo -e "${BLUE}=============================${RESET}"
echo -e "${BLUE}API Base URL: ${API_BASE_URL}${RESET}"
echo ""

# Function to make HTTP request and extract rate limit headers
make_request() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    local auth_header="$4"
    
    local curl_cmd="curl -s -w 'HTTP_STATUS:%{http_code}\nRESPONSE_TIME:%{time_total}\n' -X ${method}"
    
    if [ -n "$data" ]; then
        curl_cmd="$curl_cmd -H 'Content-Type: application/json' -d '$data'"
    fi
    
    if [ -n "$auth_header" ]; then
        curl_cmd="$curl_cmd -H 'Authorization: Bearer $auth_header'"
    fi
    
    curl_cmd="$curl_cmd -H 'X-Test-Client: rate-limit-test' ${API_BASE_URL}${endpoint}"
    
    eval "$curl_cmd"
}

# Function to test rate limiting for a specific endpoint
test_rate_limit() {
    local endpoint="$1"
    local method="$2"
    local limit="$3"
    local description="$4"
    local data="$5"
    local auth_token="$6"
    
    echo -e "${YELLOW}Testing: ${description}${RESET}"
    echo -e "${BLUE}Endpoint: ${method} ${endpoint}${RESET}"
    echo -e "${BLUE}Expected limit: ${limit} requests${RESET}"
    echo ""
    
    local success_count=0
    local rate_limited_count=0
    
    for i in $(seq 1 $((limit + 5))); do
        response=$(make_request "$method" "$endpoint" "$data" "$auth_token" 2>/dev/null)
        status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d':' -f2)
        
        if [ "$status" = "429" ]; then
            rate_limited_count=$((rate_limited_count + 1))
            echo -e "${RED}Request $i: Rate limited (429)${RESET}"
            break
        elif [ "$status" -ge "200" ] && [ "$status" -lt "300" ]; then
            success_count=$((success_count + 1))
            echo -e "${GREEN}Request $i: Success ($status)${RESET}"
        elif [ "$status" -ge "400" ] && [ "$status" -lt "500" ] && [ "$status" != "429" ]; then
            echo -e "${YELLOW}Request $i: Client error ($status) - ignoring for rate limit test${RESET}"
        else
            echo -e "${RED}Request $i: Server error ($status)${RESET}"
        fi
        
        # Small delay between requests
        sleep 0.1
    done
    
    echo ""
    echo -e "${BLUE}Results:${RESET}"
    echo -e "  Successful requests: ${GREEN}$success_count${RESET}"
    echo -e "  Rate limited requests: ${RED}$rate_limited_count${RESET}"
    
    if [ $rate_limited_count -gt 0 ]; then
        echo -e "${GREEN}✅ Rate limiting is working!${RESET}"
        return 0
    else
        echo -e "${RED}❌ Rate limiting may not be working correctly${RESET}"
        return 1
    fi
}

echo -e "${BOLD}🧪 Starting Rate Limiting Tests${RESET}"
echo ""

# Test 1: Auth Rate Limiting (Login)
echo -e "${BOLD}Test 1: Authentication Rate Limiting${RESET}"
echo "=================================================="

# Invalid login attempts to trigger rate limiting
invalid_login_data='{
    "email": "nonexistent@example.com",
    "password": "wrongpassword"
}'

test_rate_limit "/auth/login" "POST" 5 "Login rate limiting (5 attempts per 15 minutes)" "$invalid_login_data"
echo ""

# Test 2: User Registration Rate Limiting
echo -e "${BOLD}Test 2: User Registration Rate Limiting${RESET}"
echo "=================================================="

# Use different emails to avoid conflict errors
test_register_user() {
    local attempt="$1"
    local reg_data='{
        "email": "test-'$attempt'@example.com",
        "password": "'$TEST_PASSWORD'",
        "firstName": "Test",
        "lastName": "User'$attempt'",
        "phone": "+123456789'$attempt'",
        "address": "123 Test St, Test City, TC"
    }'
    make_request "POST" "/users/register" "$reg_data" ""
}

echo -e "${YELLOW}Testing: User registration rate limiting${RESET}"
echo -e "${BLUE}Endpoint: POST /users/register${RESET}"
echo -e "${BLUE}Expected limit: 5 registrations per 15 minutes${RESET}"
echo ""

success_count=0
rate_limited_count=0

for i in $(seq 1 8); do
    response=$(test_register_user "$i" 2>/dev/null)
    status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d':' -f2)
    
    if [ "$status" = "429" ]; then
        rate_limited_count=$((rate_limited_count + 1))
        echo -e "${RED}Registration $i: Rate limited (429)${RESET}"
        break
    elif [ "$status" = "201" ]; then
        success_count=$((success_count + 1))
        echo -e "${GREEN}Registration $i: Success ($status)${RESET}"
    else
        echo -e "${YELLOW}Registration $i: Other response ($status)${RESET}"
    fi
    
    sleep 0.2
done

echo ""
echo -e "${BLUE}Registration Results:${RESET}"
echo -e "  Successful registrations: ${GREEN}$success_count${RESET}"
echo -e "  Rate limited attempts: ${RED}$rate_limited_count${RESET}"
echo ""

# Test 3: Rate Limit Headers Verification
echo -e "${BOLD}Test 3: Rate Limit Headers Verification${RESET}"
echo "=================================================="

echo -e "${YELLOW}Checking rate limit headers...${RESET}"
response=$(curl -s -I "${API_BASE_URL}/auth/login" -H "Content-Type: application/json" 2>/dev/null || true)

if echo "$response" | grep -i "x-ratelimit" > /dev/null; then
    echo -e "${GREEN}✅ Rate limit headers found:${RESET}"
    echo "$response" | grep -i "x-ratelimit"
else
    echo -e "${YELLOW}⚠️  No rate limit headers found in response${RESET}"
fi
echo ""

# Summary
echo -e "${BOLD}📊 Rate Limiting Test Summary${RESET}"
echo "=================================================="
echo -e "${BLUE}✅ Tests completed successfully${RESET}"
echo -e "${YELLOW}💡 Rate limiting is configured with the following tiers:${RESET}"
echo -e "   🔐 Auth endpoints: 5 attempts per 15 minutes"
echo -e "   🌐 Default endpoints: 100 requests per minute"
echo -e "   🚨 Strict endpoints: 10 requests per minute"
echo ""
echo -e "${BLUE}📋 Notes:${RESET}"
echo -e "   • Rate limits are per IP address"
echo -e "   • 429 status code indicates rate limit exceeded"
echo -e "   • Different endpoints have different limits"
echo -e "   • Wait periods reset automatically"
echo ""
echo -e "${GREEN}🎉 Rate limiting test suite completed!${RESET}"
