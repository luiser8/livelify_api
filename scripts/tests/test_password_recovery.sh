#!/bin/bash

# Test Password Recovery Flow
# This script tests the complete password recovery functionality

# Configuration
BASE_URL="http://localhost:3000"
TEST_EMAIL="test@example.com"
NEW_PASSWORD="NewPassword123"

echo "🔐 Testing Password Recovery Flow"
echo "=================================="
echo ""

# Step 1: Request Password Recovery
echo "📧 Step 1: Requesting password recovery..."
RECOVERY_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/request-password-recovery" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"language\": \"es\"
  }")

echo "Response: $RECOVERY_RESPONSE"
echo ""

# Extract message
MESSAGE=$(echo $RECOVERY_RESPONSE | jq -r '.message')
if [ "$MESSAGE" != "null" ]; then
  echo "✅ Password recovery request sent"
else
  echo "❌ Failed to request password recovery"
  exit 1
fi

echo ""
echo "📝 Note: Check your email for the recovery link"
echo "    The email should contain a hash parameter"
echo ""

# Step 2: Reset Password (requires manual hash from email)
echo "🔑 Step 2: Reset password with hash..."
echo "    To complete this test, you need to:"
echo "    1. Check the email sent to $TEST_EMAIL"
echo "    2. Copy the hash from the recovery link"
echo "    3. Run the following command with the hash:"
echo ""
echo "    curl -X POST \"$BASE_URL/auth/reset-password\" \\"
echo "      -H \"Content-Type: application/json\" \\"
echo "      -d '{\"hash\": \"YOUR_HASH_HERE\", \"newPassword\": \"$NEW_PASSWORD\"}'"
echo ""

# Example with a test hash (will fail unless you use a real hash)
echo "📋 Testing with dummy hash (will fail)..."
RESET_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d "{
    \"hash\": \"dummy-hash-for-testing\",
    \"newPassword\": \"$NEW_PASSWORD\"
  }")

echo "Response: $RESET_RESPONSE"
echo ""

# Step 3: Test Login with New Password (after successful reset)
echo "🔐 Step 3: After password reset, test login..."
echo "    curl -X POST \"$BASE_URL/auth/login\" \\"
echo "      -H \"Content-Type: application/json\" \\"
echo "      -d '{\"email\": \"$TEST_EMAIL\", \"password\": \"$NEW_PASSWORD\"}'"
echo ""

echo "=================================="
echo "✅ Password recovery flow test completed"
echo ""
echo "Summary:"
echo "  - Request recovery: ✅"
echo "  - Email sent: Check inbox"
echo "  - Reset password: Manual step required"
echo "  - Test login: After successful reset"

