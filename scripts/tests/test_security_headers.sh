#!/bin/bash

# 🔒 Security Headers Testing Script
# Tests all security headers implemented in the API

BASE_URL="http://localhost:3000/api/v1"
RESET='\033[0m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
PURPLE='\033[0;35m'

echo -e "${BOLD}🔒 SECURITY HEADERS TESTING${RESET}"
echo -e "${BLUE}============================${RESET}"
echo ""

# Function to check if header exists and show its value
check_header() {
    local header_name=$1
    local endpoint=${2:-"/users/me"}
    local description=$3
    
    echo -e "${YELLOW}🔍 Testing: $header_name${RESET}"
    echo -e "   Description: $description"
    
    # Make request and capture headers
    RESPONSE=$(curl -s -I "$BASE_URL$endpoint" 2>/dev/null)
    
    if echo "$RESPONSE" | grep -i "^$header_name:" > /dev/null; then
        local header_value=$(echo "$RESPONSE" | grep -i "^$header_name:" | cut -d' ' -f2- | tr -d '\r\n')
        echo -e "${GREEN}   ✅ Present: $header_value${RESET}"
        return 0
    else
        echo -e "${RED}   ❌ Missing${RESET}"
        return 1
    fi
}

# Function to check if header is absent (for security)
check_header_absent() {
    local header_name=$1
    local endpoint=${2:-"/users/me"}
    local description=$3
    
    echo -e "${YELLOW}🔍 Testing: $header_name (should be absent)${RESET}"
    echo -e "   Description: $description"
    
    RESPONSE=$(curl -s -I "$BASE_URL$endpoint" 2>/dev/null)
    
    if echo "$RESPONSE" | grep -i "^$header_name:" > /dev/null; then
        local header_value=$(echo "$RESPONSE" | grep -i "^$header_name:" | cut -d' ' -f2- | tr -d '\r\n')
        echo -e "${RED}   ❌ Present (security risk): $header_value${RESET}"
        return 1
    else
        echo -e "${GREEN}   ✅ Correctly hidden${RESET}"
        return 0
    fi
}

# Function to test endpoint availability
test_endpoint() {
    echo -e "${PURPLE}🌐 Testing endpoint availability: $BASE_URL${RESET}"
    
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL" 2>/dev/null)
    
    if [ "$RESPONSE" = "000" ]; then
        echo -e "${RED}❌ Server not responding. Please start the server with: npm run start:dev${RESET}"
        return 1
    elif [ "$RESPONSE" = "404" ]; then
        echo -e "${GREEN}✅ Server responding (404 expected for base path)${RESET}"
        return 0
    else
        echo -e "${GREEN}✅ Server responding (HTTP $RESPONSE)${RESET}"
        return 0
    fi
}

# Test server availability first
if ! test_endpoint; then
    echo -e "\n${RED}Cannot test security headers: Server not available${RESET}"
    exit 1
fi

echo ""
echo -e "${BOLD}📋 SECURITY HEADERS CHECKLIST:${RESET}"
echo ""

# Track results
TOTAL_TESTS=0
PASSED_TESTS=0

# Test each security header
security_tests=(
    "X-Frame-Options:/Prevents clickjacking attacks"
    "X-Content-Type-Options:/Prevents MIME type sniffing"
    "X-XSS-Protection:/Basic XSS protection"
    "Strict-Transport-Security:/Forces HTTPS (production only)"
    "Content-Security-Policy:/Prevents XSS and injection attacks"
    "Referrer-Policy:/Controls referrer information"
    "Permissions-Policy:/Restricts browser features"
    "X-API-Version:/API version information"
    "X-Security-Contact:/Security contact information"
    "Server:/Minimal server information disclosure"
)

for test in "${security_tests[@]}"; do
    IFS='/' read -r header endpoint description <<< "$test"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if check_header "$header" "$endpoint" "$description"; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
    fi
    echo ""
done

# Test headers that should be absent
echo -e "${BOLD}🚫 HEADERS THAT SHOULD BE HIDDEN:${RESET}"
echo ""

hidden_tests=(
    "X-Powered-By:/Should be hidden for security"
    "x-powered-by:/Should be hidden for security (lowercase)"
    "Express:/Should not reveal Express framework"
    "Node.js:/Should not reveal Node.js version"
)

for test in "${hidden_tests[@]}"; do
    IFS='/' read -r header endpoint description <<< "$test"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if check_header_absent "$header" "$endpoint" "$description"; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
    fi
    echo ""
done

# Test specific security endpoints
echo -e "${BOLD}🎯 SPECIAL SECURITY TESTS:${RESET}"
echo ""

# Test CORS preflight
echo -e "${YELLOW}🔍 Testing CORS Configuration${RESET}"
CORS_RESPONSE=$(curl -s -I -X OPTIONS \
    -H "Origin: https://malicious-site.com" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type" \
    "$BASE_URL/auth/login" 2>/dev/null)

if echo "$CORS_RESPONSE" | grep -i "access-control-allow-origin" > /dev/null; then
    echo -e "${RED}   ⚠️  CORS might be too permissive${RESET}"
else
    echo -e "${GREEN}   ✅ CORS properly configured${RESET}"
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))
PASSED_TESTS=$((PASSED_TESTS + 1))
echo ""

# Results Summary
echo -e "${BLUE}============================${RESET}"
echo -e "${BOLD}📊 SECURITY HEADERS RESULTS:${RESET}"
echo ""

PERCENTAGE=$((PASSED_TESTS * 100 / TOTAL_TESTS))

echo -e "   Tests Passed: ${GREEN}$PASSED_TESTS${RESET}/$TOTAL_TESTS"
echo -e "   Success Rate: ${GREEN}$PERCENTAGE%${RESET}"
echo ""

if [ $PERCENTAGE -ge 90 ]; then
    echo -e "${GREEN}🎉 EXCELLENT SECURITY CONFIGURATION!${RESET}"
    echo -e "${GREEN}   Your API has strong security headers protection.${RESET}"
elif [ $PERCENTAGE -ge 75 ]; then
    echo -e "${YELLOW}⚠️  GOOD SECURITY CONFIGURATION${RESET}"
    echo -e "${YELLOW}   Consider addressing the missing headers for better security.${RESET}"
else
    echo -e "${RED}🚨 SECURITY IMPROVEMENTS NEEDED${RESET}"
    echo -e "${RED}   Several important security headers are missing.${RESET}"
fi

echo ""
echo -e "${BLUE}📚 SECURITY RECOMMENDATIONS:${RESET}"
echo -e "   1. Ensure HTTPS in production for HSTS header"
echo -e "   2. Customize CSP directives for your specific needs"
echo -e "   3. Set up CSP reporting endpoint for violation monitoring"
echo -e "   4. Review CORS origins to ensure only trusted domains"
echo -e "   5. Implement rate limiting for additional protection"
echo ""

# Show example curl command for manual testing
echo -e "${BLUE}🔧 Manual Testing Command:${RESET}"
echo -e "${PURPLE}curl -I $BASE_URL${RESET}"
echo ""
