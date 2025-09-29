# 🚦 Rate Limiting Implementation Guide

## 📋 Overview

The Livelify API implements a comprehensive multi-tier rate limiting system using `@nestjs/throttler` to protect against abuse, brute force attacks, and excessive API usage. This system provides different rate limits based on endpoint sensitivity and user authentication status.

## 🏗️ Architecture

### 1. Multi-Tier Rate Limiting

The system implements four distinct rate limiting tiers:

```typescript
// Rate Limiting Tiers
{
  name: 'default',
  ttl: 60000,     // 1 minute
  limit: 100      // 100 requests per minute
},
{
  name: 'auth',
  ttl: 900000,    // 15 minutes
  limit: 5        // 5 attempts per 15 minutes
},
{
  name: 'strict',
  ttl: 60000,     // 1 minute
  limit: 10       // 10 requests per minute
},
{
  name: 'public',
  ttl: 60000,     // 1 minute
  limit: 1000     // 1000 requests per minute
}
```

### 2. Applied Rate Limits by Endpoint

| Endpoint Category | Rate Limit | Time Window | Description |
|------------------|------------|-------------|-------------|
| **Authentication** | 5 requests | 15 minutes | Login, Register, Password Reset |
| **User Management** | 10 requests | 1 minute | Profile Updates, Settings |
| **General API** | 100 requests | 1 minute | Profile View, Data Retrieval |
| **Public Endpoints** | 1000 requests | 1 minute | Health Checks, Documentation |

## 🔧 Implementation Details

### 1. Module Configuration

```typescript
// app.module.ts
ThrottlerModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => [
    {
      name: 'default',
      ttl: configService.get<number>('THROTTLE_TTL', 60000),
      limit: configService.get<number>('THROTTLE_LIMIT', 100),
    },
    {
      name: 'auth',
      ttl: configService.get<number>('THROTTLE_AUTH_TTL', 900000),
      limit: configService.get<number>('THROTTLE_AUTH_LIMIT', 5),
    },
    {
      name: 'strict',
      ttl: configService.get<number>('THROTTLE_STRICT_TTL', 60000),
      limit: configService.get<number>('THROTTLE_STRICT_LIMIT', 10),
    },
  ],
})
```

### 2. Custom Decorators

```typescript
// Custom throttle decorators for different security levels
@AuthThrottle()     // 5 attempts per 15 minutes
@DefaultThrottle()  // 100 requests per minute
@StrictThrottle()   // 10 requests per minute
@PublicThrottle()   // 1000 requests per minute
@SkipThrottle()     // Disable rate limiting
```

### 3. Applied Rate Limiting

#### Authentication Endpoints
```typescript
@Post('login')
@Public()
@AuthThrottle() // 🔐 5 attempts per 15 minutes
@ApiResponse({ status: 429, description: 'Too Many Requests - rate limit exceeded' })
async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
  // Implementation
}
```

#### User Management Endpoints
```typescript
@Put('update')
@StrictThrottle() // 🚨 10 requests per minute
@ApiResponse({ status: 429, description: 'Too Many Requests - rate limit exceeded' })
async update(@Body() updateDto: UpdateUserProfileDto): Promise<UserProfileResponseDto> {
  // Implementation
}
```

## 🌍 Environment Configuration

### Development Environment
```env
# Rate Limiting - Development (Permissive)
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
THROTTLE_AUTH_TTL=900000
THROTTLE_AUTH_LIMIT=5
THROTTLE_STRICT_TTL=60000
THROTTLE_STRICT_LIMIT=10
```

### QA Environment
```env
# Rate Limiting - QA (More Restrictive)
THROTTLE_TTL=60000
THROTTLE_LIMIT=50
THROTTLE_AUTH_TTL=900000
THROTTLE_AUTH_LIMIT=3
THROTTLE_STRICT_TTL=60000
THROTTLE_STRICT_LIMIT=5
```

### Production Environment
```env
# Rate Limiting - Production (Very Restrictive)
THROTTLE_TTL=60000
THROTTLE_LIMIT=20
THROTTLE_AUTH_TTL=900000
THROTTLE_AUTH_LIMIT=2
THROTTLE_STRICT_TTL=60000
THROTTLE_STRICT_LIMIT=3
```

## 🛡️ Security Features

### 1. IP-Based Rate Limiting
- Tracks requests per IP address
- Prevents distributed attacks from single sources
- Configurable time windows and limits

### 2. Authentication Protection
- Stricter limits on sensitive endpoints
- Prevents brute force attacks on login
- Protects user registration from spam

### 3. Graduated Response
- Different limits for different endpoint types
- More restrictive for write operations
- Permissive for read-only operations

### 4. Enhanced Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 2024-03-15T10:30:00.000Z
X-RateLimit-Policy: Multi-tier rate limiting active
Retry-After: 45
```

## 📊 Monitoring and Observability

### 1. Rate Limit Headers
All responses include rate limiting information:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: When the rate limit resets
- `Retry-After`: Seconds to wait before retrying (when rate limited)

### 2. Security Headers
```http
X-RateLimit-Policy: API rate limits apply
X-RateLimit-Auth: 5 per 15 minutes
X-RateLimit-Default: 100 per minute
X-RateLimit-Strict: 10 per minute
```

### 3. Logging
Rate limit violations are logged with:
```typescript
{
  ip: "192.168.1.100",
  url: "/api/v1/auth/login",
  method: "POST",
  userAgent: "Mozilla/5.0...",
  timestamp: "2024-03-15T10:30:00.000Z"
}
```

## 🧪 Testing

### 1. Automated Testing
```bash
# Run rate limiting tests
./scripts/tests/test_rate_limiting.sh

# Test specific endpoint
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrong"}' \
  -v
```

### 2. Test Results Interpretation
- **Status 200-299**: Request successful, check remaining limits
- **Status 429**: Rate limit exceeded, check `Retry-After` header
- **Headers**: Monitor `X-RateLimit-*` headers for usage patterns

## 🔄 Best Practices

### 1. Client Implementation
```javascript
// Example client-side rate limit handling
async function makeAPIRequest(url, options) {
  try {
    const response = await fetch(url, options);
    
    // Check rate limit headers
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const reset = response.headers.get('X-RateLimit-Reset');
    
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new Error(`Rate limited. Retry after ${retryAfter} seconds.`);
    }
    
    return response;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}
```

### 2. Configuration Guidelines
- **Development**: Permissive limits for testing
- **QA**: Production-like but slightly more permissive
- **Production**: Strict limits based on actual usage patterns

### 3. Monitoring Recommendations
- Track rate limit hit rates
- Monitor false positives (legitimate users being rate limited)
- Adjust limits based on usage patterns
- Set up alerts for unusual rate limiting patterns

## 🚨 Error Handling

### 1. Rate Limit Exceeded Response
```json
{
  "statusCode": 429,
  "message": "Rate limit exceeded. Too many requests from 192.168.1.100. Please try again later.",
  "error": "Too Many Requests"
}
```

### 2. Client Recommendations
- Implement exponential backoff
- Respect `Retry-After` headers
- Cache responses when appropriate
- Use efficient polling strategies

## 📈 Performance Considerations

### 1. Memory Usage
- Rate limiting data stored in memory
- Automatic cleanup of expired entries
- Configurable storage backends available

### 2. Scalability
- Per-instance rate limiting (consider Redis for distributed systems)
- Horizontal scaling considerations
- Load balancer configuration impact

## 🔮 Future Enhancements

### 1. Planned Features
- User-based rate limiting (authenticated users)
- Dynamic rate limiting based on server load
- API key-based rate limiting
- Geographic rate limiting

### 2. Integration Opportunities
- Redis backend for distributed rate limiting
- Prometheus metrics integration
- Advanced analytics and reporting

## 📚 Additional Resources

- [NestJS Throttler Documentation](https://docs.nestjs.com/security/rate-limiting)
- [HTTP 429 Too Many Requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429)
- [Rate Limiting Strategies](https://cloud.google.com/architecture/rate-limiting-strategies)

---

*This implementation provides robust protection against API abuse while maintaining good user experience for legitimate usage patterns.*
