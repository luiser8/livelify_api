#!/bin/bash

# Test Health Endpoints
# Este script prueba todos los endpoints de health implementados

echo "🏥 Testing Health Endpoints"
echo "=========================="

BASE_URL="http://localhost:3000/api/health"

echo ""
echo "📋 1. Testing Liveness Endpoint..."
echo "GET $BASE_URL/liveness"
curl -s -w "\nStatus: %{http_code}\n" "$BASE_URL/liveness" | jq '.' 2>/dev/null || echo "Response received (jq not available for formatting)"

echo ""
echo "📋 2. Testing Readiness Endpoint..."
echo "GET $BASE_URL/readiness"
curl -s -w "\nStatus: %{http_code}\n" "$BASE_URL/readiness" | jq '.' 2>/dev/null || echo "Response received (jq not available for formatting)"

echo ""
echo "📋 3. Testing Startup Endpoint..."
echo "GET $BASE_URL/startup"
curl -s -w "\nStatus: %{http_code}\n" "$BASE_URL/startup" | jq '.' 2>/dev/null || echo "Response received (jq not available for formatting)"

echo ""
echo "✅ Health endpoint tests completed!"
echo ""
echo "💡 Expected responses:"
echo "   - Status 200: Service is healthy"
echo "   - Status 503: Service is unhealthy"
echo ""
echo "🔗 Swagger documentation available at:"
echo "   http://localhost:3000/api/docs"

