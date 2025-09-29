#!/bin/bash

# Test script for user registration with LifeWheel creation
# This script tests that when a user registers, a LifeWheel with all predefined areas is created

API_BASE_URL="http://localhost:3000"
REGISTER_ENDPOINT="$API_BASE_URL/users/register"

echo "🧪 Testing User Registration with LifeWheel Creation"
echo "=================================================="

# Test data
EMAIL="testuser_$(date +%s)@example.com"
PASSWORD="TestPassword123!"
FIRST_NAME="John"
LAST_NAME="Doe"
ADDRESS="123 Test Street, Test City, Test Country"
PHONE="+1234567890"

echo "📝 Registering user with email: $EMAIL"

# Make the registration request
RESPONSE=$(curl -s -X POST "$REGISTER_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"firstName\": \"$FIRST_NAME\",
    \"lastName\": \"$LAST_NAME\",
    \"address\": \"$ADDRESS\",
    \"phone\": \"$PHONE\"
  }")

# Check if request was successful
if [ $? -eq 0 ]; then
  echo "✅ Registration request completed"
  
  # Parse response to check for LifeWheel
  echo "📊 Response:"
  echo "$RESPONSE" | jq '.'
  
  # Check if lifeWheel exists in response
  LIFEWHEEL_ID=$(echo "$RESPONSE" | jq -r '.lifeWheel.id // empty')
  LIFEWHEEL_AREAS_COUNT=$(echo "$RESPONSE" | jq -r '.lifeWheel.lifeAreas | length // 0')
  
  if [ -n "$LIFEWHEEL_ID" ] && [ "$LIFEWHEEL_ID" != "null" ]; then
    echo "✅ LifeWheel created successfully with ID: $LIFEWHEEL_ID"
    echo "📈 Number of life areas created: $LIFEWHEEL_AREAS_COUNT"
    
    # Expected areas: PERSONAL_DEVELOPMENT, PROFESSIONAL_ACTIVITY, HEALTH_NUTRITION, MONEY_FINANCES, SOCIAL_RELATIONSHIPS, COUPLE_INTIMACY
    if [ "$LIFEWHEEL_AREAS_COUNT" -eq 6 ]; then
      echo "✅ All 6 predefined areas were created correctly"
      
      # Show area details
      echo "📋 Life Areas created:"
      echo "$RESPONSE" | jq -r '.lifeWheel.lifeAreas[] | "- \(.areaName): Score \(.score)"'
      
      # Check if any area has "Unknown" as name
      UNKNOWN_AREAS=$(echo "$RESPONSE" | jq -r '.lifeWheel.lifeAreas[] | select(.areaName == "Unknown") | .areaName' | wc -l)
      if [ "$UNKNOWN_AREAS" -gt 0 ]; then
        echo "❌ Found $UNKNOWN_AREAS areas with 'Unknown' name - area names are not being loaded correctly"
      else
        echo "✅ All areas have proper names loaded"
      fi
      
    else
      echo "❌ Expected 6 areas, but got $LIFEWHEEL_AREAS_COUNT"
    fi
  else
    echo "❌ LifeWheel was not created in the response"
  fi
  
else
  echo "❌ Registration request failed"
fi

echo ""
echo "🏁 Test completed"
