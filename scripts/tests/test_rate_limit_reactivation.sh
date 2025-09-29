#!/bin/bash

# 🕐 Rate Limit Reactivation Test Script
# Demonstrates how rate limiting resets after TTL expires

set -e

RESET='\033[0m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
CYAN='\033[0;36m'

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:3000/api/v1}"

echo -e "${BOLD}🕐 Rate Limit Reactivation Demo${RESET}"
echo -e "${BLUE}===================================${RESET}"
echo -e "${BLUE}API Base URL: ${API_BASE_URL}${RESET}"
echo ""

# Function to make HTTP request and get status code with timing
make_request_with_time() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    local timestamp=$(date '+%H:%M:%S')
    
    local curl_cmd="curl -s -w '%{http_code}' -o /dev/null -X ${method}"
    
    if [ -n "$data" ]; then
        curl_cmd="$curl_cmd -H 'Content-Type: application/json' -d '$data'"
    fi
    
    curl_cmd="$curl_cmd ${API_BASE_URL}${endpoint}"
    
    local status_code
    status_code=$(eval "$curl_cmd")
    
    echo -e "${CYAN}[$timestamp]${RESET} Status: $status_code"
    return "$status_code"
}

# Function to test rate limit with timing
test_rate_limit_cycle() {
    local endpoint="$1"
    local method="$2"
    local data="$3"
    local limit="$4"
    local ttl_seconds="$5"
    local description="$6"
    
    echo -e "${BOLD}🧪 Testing: ${description}${RESET}"
    echo -e "${BLUE}Endpoint: ${method} ${endpoint}${RESET}"
    echo -e "${BLUE}Limit: ${limit} requests${RESET}"
    echo -e "${BLUE}TTL: ${ttl_seconds} seconds${RESET}"
    echo ""
    
    echo -e "${YELLOW}Phase 1: Testing until rate limit is reached${RESET}"
    local request_count=0
    local rate_limited=false
    
    # Test until rate limited
    for i in $(seq 1 $((limit + 2))); do
        request_count=$((request_count + 1))
        echo -n "Request $request_count: "
        
        if make_request_with_time "$method" "$endpoint" "$data"; then
            local status=$?
            if [ $status -eq 200 ] || [ $status -eq 201 ] || [ $status -eq 401 ]; then
                echo -e "  ${GREEN}✅ Allowed${RESET}"
            elif [ $status -eq 429 ]; then
                echo -e "  ${RED}❌ Rate Limited (429)${RESET}"
                rate_limited=true
                break
            else
                echo -e "  ${YELLOW}⚠️  Other status ($status)${RESET}"
            fi
        fi
        
        sleep 0.1
    done
    
    if [ "$rate_limited" = true ]; then
        echo -e "${RED}🚫 Rate limit reached after $request_count requests${RESET}"
        echo ""
        
        echo -e "${YELLOW}Phase 2: Waiting for rate limit to reset...${RESET}"
        echo -e "${BLUE}TTL Duration: ${ttl_seconds} seconds${RESET}"
        echo -e "${CYAN}Current time: $(date '+%H:%M:%S')${RESET}"
        echo -e "${CYAN}Reset time: $(date -d "+${ttl_seconds} seconds" '+%H:%M:%S')${RESET}"
        echo ""
        
        # Show countdown
        for ((i=ttl_seconds; i>0; i--)); do
            printf "\r${YELLOW}⏳ Waiting... %02d:%02d remaining${RESET}" $((i/60)) $((i%60))
            sleep 1
        done
        printf "\r${GREEN}✅ TTL expired! Testing reactivation...        ${RESET}\n"
        echo ""
        
        echo -e "${YELLOW}Phase 3: Testing after TTL expiration${RESET}"
        echo -n "Post-reset request: "
        
        if make_request_with_time "$method" "$endpoint" "$data"; then
            local status=$?
            if [ $status -eq 200 ] || [ $status -eq 201 ] || [ $status -eq 401 ]; then
                echo -e "  ${GREEN}✅ Rate limit successfully reset!${RESET}"
                return 0
            elif [ $status -eq 429 ]; then
                echo -e "  ${RED}❌ Still rate limited (unexpected)${RESET}"
                return 1
            else
                echo -e "  ${YELLOW}⚠️  Other status ($status)${RESET}"
                return 0
            fi
        fi
    else
        echo -e "${YELLOW}⚠️  Rate limit not reached (limit might be too high)${RESET}"
        return 0
    fi
}

echo -e "${BOLD}🔐 Demo 1: Auth Rate Limiting (Fast Demo)${RESET}"
echo "=================================================="
echo -e "${BLUE}This demo uses a shorter TTL for demonstration purposes${RESET}"
echo ""

# Create test data for login attempts
invalid_login_data='{
    "email": "demo@example.com",
    "password": "wrongpassword"
}'

# For demo purposes, we'll use default rate limiting which resets every minute
echo -e "${YELLOW}Using Default Rate Limiting (1 minute TTL) for demo${RESET}"
echo -e "${BLUE}In production, auth endpoints use 15-minute TTL${RESET}"
echo ""

# Test with multiple requests to trigger rate limiting faster
echo -e "${YELLOW}Making rapid requests to trigger rate limiting...${RESET}"

for i in {1..15}; do
    echo -n "Rapid request $i: "
    status=$(curl -s -w '%{http_code}' -o /dev/null -X POST \
        -H 'Content-Type: application/json' \
        -d "$invalid_login_data" \
        "${API_BASE_URL}/auth/login")
    
    if [ "$status" = "429" ]; then
        echo -e "${RED}❌ Rate Limited (429) - Limit reached!${RESET}"
        break
    else
        echo -e "${GREEN}✅ Status: $status${RESET}"
    fi
    
    sleep 0.1
done

echo ""
echo -e "${CYAN}⏰ Current time: $(date '+%H:%M:%S')${RESET}"
echo -e "${YELLOW}⏳ Waiting 65 seconds for rate limit to reset...${RESET}"

# Countdown for 65 seconds (to ensure 1-minute window expires)
for ((i=65; i>0; i--)); do
    printf "\r${YELLOW}⏳ Reset in: %02d:%02d${RESET}" $((i/60)) $((i%60))
    sleep 1
done

printf "\r${GREEN}✅ Testing after reset...                    ${RESET}\n"
echo ""

# Test after reset
echo -n "Post-reset request: "
status=$(curl -s -w '%{http_code}' -o /dev/null -X POST \
    -H 'Content-Type: application/json' \
    -d "$invalid_login_data" \
    "${API_BASE_URL}/auth/login")

if [ "$status" = "401" ]; then
    echo -e "${GREEN}✅ Rate limit reset! Got expected 401 (invalid credentials)${RESET}"
elif [ "$status" = "429" ]; then
    echo -e "${RED}❌ Still rate limited${RESET}"
else
    echo -e "${BLUE}ℹ️  Got status: $status${RESET}"
fi

echo ""

# Summary
echo -e "${BOLD}📊 Rate Limit Reactivation Summary${RESET}"
echo "=================================================="
echo -e "${GREEN}✅ Rate limiting demonstration completed${RESET}"
echo ""
echo -e "${BLUE}📋 How Rate Limiting Works:${RESET}"
echo -e "  1. ${CYAN}Counter starts${RESET} with first request"
echo -e "  2. ${CYAN}Requests counted${RESET} until limit reached"
echo -e "  3. ${RED}429 status${RESET} returned when limit exceeded"
echo -e "  4. ${YELLOW}TTL timer${RESET} runs in background"
echo -e "  5. ${GREEN}Counter resets${RESET} when TTL expires"
echo -e "  6. ${GREEN}Requests allowed${RESET} again automatically"
echo ""
echo -e "${BLUE}⏰ TTL Values in Production:${RESET}"
echo -e "  • ${CYAN}Auth endpoints${RESET}: 15 minutes (login, register)"
echo -e "  • ${CYAN}Strict endpoints${RESET}: 1 minute (updates, logout)"
echo -e "  • ${CYAN}Default endpoints${RESET}: 1 minute (general API)"
echo ""
echo -e "${YELLOW}💡 Key Point:${RESET} Rate limits reset ${BOLD}automatically${RESET} - no manual intervention needed!"
echo ""
echo -e "${GREEN}🎉 Rate limit reactivation test completed!${RESET}"
