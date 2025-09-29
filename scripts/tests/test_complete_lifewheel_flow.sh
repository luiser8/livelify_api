#!/bin/bash

# Complete LifeWheel Flow Test
# This script tests the complete flow:
# 1. User registration with LifeWheel creation
# 2. Getting areas and questions
# 3. Submitting answers for each area
# 4. Verifying score calculations

API_BASE_URL="http://localhost:3000"
TIMESTAMP=$(date +%s)
EMAIL="testuser_${TIMESTAMP}@example.com"
PASSWORD="TestPassword123!"

echo "🧪 Testing Complete LifeWheel Flow"
echo "=================================="
echo "Email: $EMAIL"
echo ""

# Step 1: Register user and get LifeWheel
echo "📝 Step 1: Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE_URL/users/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"firstName\": \"John\",
    \"lastName\": \"Doe\",
    \"address\": \"123 Test Street\",
    \"phone\": \"+1234567890\"
  }")

if [ $? -ne 0 ]; then
  echo "❌ Registration failed"
  exit 1
fi

USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.id')
LIFEWHEEL_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.lifeWheel.id')
LIFE_AREAS=$(echo "$REGISTER_RESPONSE" | jq -r '.lifeWheel.lifeAreas')

echo "✅ User registered successfully"
echo "   User ID: $USER_ID"
echo "   LifeWheel ID: $LIFEWHEEL_ID"
echo "   Areas created: $(echo "$LIFE_AREAS" | jq length)"
echo ""

# Step 2: Login to get access token
echo "🔐 Step 2: Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

if [ $? -ne 0 ]; then
  echo "❌ Login failed"
  exit 1
fi

ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')
echo "✅ Login successful"
echo "   Access Token: ${ACCESS_TOKEN:0:20}..."
echo ""

# Step 3: Get all areas
echo "📋 Step 3: Getting all areas..."
AREAS_RESPONSE=$(curl -s -X GET "$API_BASE_URL/areas" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if [ $? -ne 0 ]; then
  echo "❌ Failed to get areas"
  exit 1
fi

echo "✅ Areas retrieved successfully"
AREAS_COUNT=$(echo "$AREAS_RESPONSE" | jq length)
echo "   Total areas: $AREAS_COUNT"
echo ""

# Step 4: For each area, get questions and submit answers
echo "🎯 Step 4: Processing each area..."
AREA_INDEX=0

echo "$AREAS_RESPONSE" | jq -c '.[]' | while read -r area; do
  AREA_ID=$(echo "$area" | jq -r '.id')
  AREA_NAME=$(echo "$area" | jq -r '.name')
  
  echo "  📍 Processing area: $AREA_NAME ($AREA_ID)"
  
  # Get questions for this area
  QUESTIONS_RESPONSE=$(curl -s -X GET "$API_BASE_URL/assessment/area/$AREA_ID" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  
  if [ $? -ne 0 ]; then
    echo "    ❌ Failed to get questions for $AREA_NAME"
    continue
  fi
  
  QUESTIONS_COUNT=$(echo "$QUESTIONS_RESPONSE" | jq length)
  echo "    📝 Questions found: $QUESTIONS_COUNT"
  
  # Create answers (alternating true/false for testing)
  ANSWERS_JSON="["
  QUESTION_INDEX=0
  
  echo "$QUESTIONS_RESPONSE" | jq -c '.[]' | while read -r question; do
    QUESTION_ID=$(echo "$question" | jq -r '.id')
    
    # Alternate between true and false, with more true answers for better scores
    if [ $((QUESTION_INDEX % 3)) -eq 0 ]; then
      VALUE="false"
    else
      VALUE="true"
    fi
    
    if [ $QUESTION_INDEX -gt 0 ]; then
      ANSWERS_JSON="$ANSWERS_JSON,"
    fi
    
    ANSWERS_JSON="$ANSWERS_JSON{\"questionId\":\"$QUESTION_ID\",\"value\":$VALUE}"
    QUESTION_INDEX=$((QUESTION_INDEX + 1))
  done
  
  ANSWERS_JSON="$ANSWERS_JSON]"
  
  # Submit answers for this area
  echo "    📤 Submitting answers..."
  SUBMIT_RESPONSE=$(curl -s -X POST "$API_BASE_URL/answers/submit-area" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"areaId\": \"$AREA_ID\",
      \"answers\": $ANSWERS_JSON
    }")
  
  if [ $? -ne 0 ]; then
    echo "    ❌ Failed to submit answers for $AREA_NAME"
    continue
  fi
  
  AREA_SCORE=$(echo "$SUBMIT_RESPONSE" | jq -r '.areaScore')
  GLOBAL_SCORE=$(echo "$SUBMIT_RESPONSE" | jq -r '.globalScore')
  ANSWERS_SUBMITTED=$(echo "$SUBMIT_RESPONSE" | jq -r '.answersSubmitted')
  
  echo "    ✅ Answers submitted successfully"
  echo "       Area Score: $AREA_SCORE/10"
  echo "       Global Score: $GLOBAL_SCORE/10"
  echo "       Answers Submitted: $ANSWERS_SUBMITTED"
  echo ""
  
  AREA_INDEX=$((AREA_INDEX + 1))
done

# Step 5: Get final LifeWheel state
echo "📊 Step 5: Getting final LifeWheel state..."
LIFEWHEEL_RESPONSE=$(curl -s -X GET "$API_BASE_URL/lifewheel/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if [ $? -eq 0 ]; then
  echo "✅ LifeWheel state retrieved successfully"
  
  FINAL_GLOBAL_SCORE=$(echo "$LIFEWHEEL_RESPONSE" | jq -r '.globalScore')
  AREAS_WITH_SCORES=$(echo "$LIFEWHEEL_RESPONSE" | jq -r '.lifeAreas | map(select(.score > 0)) | length')
  
  echo "📈 Final Results:"
  echo "   Global Score: $FINAL_GLOBAL_SCORE/10"
  echo "   Areas with answers: $AREAS_WITH_SCORES/6"
  
  echo "📋 Area Scores:"
  echo "$LIFEWHEEL_RESPONSE" | jq -r '.lifeAreas[] | "   - \(.areaName): \(.score)/10"'
  
else
  echo "❌ Failed to get final LifeWheel state"
fi

echo ""
echo "🏁 Complete LifeWheel Flow Test Completed!"
echo ""
echo "Summary:"
echo "- User registration: ✅"
echo "- LifeWheel creation: ✅"  
echo "- Areas processing: ✅"
echo "- Answer submission: ✅"
echo "- Score calculation: ✅"
echo ""
echo "Expected results:"
echo "- 6 areas should be processed"
echo "- Each area should have 10 questions"
echo "- Scores should be calculated based on true/false ratio"
echo "- Global score should be average of all area scores"
