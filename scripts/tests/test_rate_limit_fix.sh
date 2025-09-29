#!/bin/bash

# 🧪 Test Rate Limiting Fix
# This script tests the corrected rate limiting configuration

set -e

API_BASE_URL="http://localhost:3000/api/v1"
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Testing Rate Limiting Fix${NC}"
echo "=================================="

# Function to make HTTP request and check rate limit headers
test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_limit=$3
    local expected_window=$4
    local description=$5
    
    echo -e "\n${YELLOW}Testing: $description${NC}"
    echo "Endpoint: $method $endpoint"
    echo "Expected: $expected_limit requests per $expected_window"
    
    # Make request and capture headers
    response=$(curl -s -i -X $method "$API_BASE_URL$endpoint" \
        -H "Content-Type: application/json" \
        -d '{"email":"test@example.com","password":"wrongpassword"}' 2>/dev/null || true)
    
    # Extract rate limit headers
    limit=$(echo "$response" | grep -i "x-ratelimit-limit:" | head -1 | cut -d' ' -f2 | tr -d '\r\n' || echo "Not found")
    remaining=$(echo "$response" | grep -i "x-ratelimit-remaining:" | head -1 | cut -d' ' -f2 | tr -d '\r\n' || echo "Not found")
    reset=$(echo "$response" | grep -i "x-ratelimit-reset:" | head -1 | cut -d' ' -f2 | tr -d '\r\n' || echo "Not found")
    
    echo "Rate Limit Headers:"
    echo "  Limit: $limit"
    echo "  Remaining: $remaining"
    echo "  Reset: $reset"
    
    # Check if limit matches expected
    if [[ "$limit" == "$expected_limit" ]]; then
        echo -e "${GREEN}✅ Rate limit configured correctly${NC}"
    else
        echo -e "${RED}❌ Rate limit mismatch. Expected: $expected_limit, Got: $limit${NC}"
    fi
}

# Test Auth endpoints (should be 5 per 15 minutes)
echo -e "\n${BLUE}🔐 Testing Auth Rate Limiting${NC}"
test_endpoint "POST" "/auth/login" "5" "15 minutes" "Login endpoint"

# Test Default endpoints (should be 100 per minute in dev, varies by environment)
echo -e "\n${BLUE}🌐 Testing Default Rate Limiting${NC}"
test_endpoint "GET" "/users/me" "100" "1 minute" "User profile endpoint"

# Test Strict endpoints (should be 10 per minute)
echo -e "\n${BLUE}🚨 Testing Strict Rate Limiting${NC}"
test_endpoint "POST" "/auth/refresh" "10" "1 minute" "Token refresh endpoint"
test_endpoint "PUT" "/users/update" "10" "1 minute" "User update endpoint"

# Test rate limit exhaustion for auth endpoint
echo -e "\n${BLUE}🔥 Testing Rate Limit Exhaustion${NC}"
echo "Making 6 consecutive login attempts (should hit rate limit on 6th)..."

for i in {1..6}; do
    echo -n "Attempt $i: "
    
    response=$(curl -s -w "%{http_code}" -X POST "$API_BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"test@example.com","password":"wrongpassword"}' \
        -o /dev/null 2>/dev/null || echo "000")
    
    if [[ "$response" == "429" ]]; then
        echo -e "${RED}429 Too Many Requests ✅ (Rate limit working!)${NC}"
        break
    elif [[ "$response" == "401" ]]; then
        echo -e "${YELLOW}401 Unauthorized (within rate limit)${NC}"
    else
        echo -e "${GREEN}$response${NC}"
    fi
    
    sleep 0.5
done

# Test rate limit reset
echo -e "\n${BLUE}⏰ Testing Rate Limit Reset${NC}"
echo "Waiting for rate limit to reset..."
echo "Note: In production, this would take 15 minutes for auth endpoints"
echo "For testing, you may need to restart the server or wait for the TTL"

# Display current environment configuration
echo -e "\n${BLUE}📊 Current Environment Configuration${NC}"
echo "=================================="

if [[ -f ".env.development" ]]; then
    echo "Rate limiting configuration from .env.development:"
    grep "THROTTLE" .env.development | while read line; do
        echo "  $line"
    done
else
    echo "⚠️  .env.development file not found"
fi

echo -e "\n${GREEN}🎯 Rate Limiting Test Complete!${NC}"
echo "=================================="
echo "Key fixes applied:"
echo "✅ Login endpoint now uses AuthThrottle (5 per 15min)"
echo "✅ Decorators now use environment variables"
echo "✅ Consistent rate limiting across endpoints"
echo ""
echo "If rate limits are not working as expected:"
echo "1. Restart the server: pnpm start:dev"
echo "2. Check .env.development file exists"
echo "3. Verify THROTTLE_* variables are set"
echo "4. Check server logs for rate limiting messages"
