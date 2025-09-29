# 🌍 Environment Setup Guide

## 📋 Overview

This guide explains how to configure environment variables for the Livelify API, including the new rate limiting configuration.

## 🔧 Environment Variables

### 📁 Creating Environment Files

Create environment files for each environment:

```bash
# Development environment
touch .env.development

# QA environment  
touch .env.qa

# Production environment
touch .env.production
```

### 🔧 Development Configuration (.env.development)

```env
# ================================
# 🔧 APPLICATION CONFIGURATION
# ================================
NODE_ENV=development
APP_ENV=development
APP_DEBUG=true
APP_PORT=3000
APP_PREFIX=api
APP_VERSION=v1

# ================================
# 🔒 SECURITY CONFIGURATION
# ================================
APP_JWT_SECRET=dev-jwt-secret-key-for-development-only-32-chars-minimum-length
APP_JWT_EXPIRE=1h

# ================================
# 📚 DOCUMENTATION
# ================================
APP_SWAGGER_UI=true
APP_TITLE=Livelify API - Development
APP_DESCRIPTION=Livelify API Application (Development Environment)

# ================================
# 🌐 CORS CONFIGURATION
# ================================
APP_ALLOWED_ORIGINS=http://localhost:3000;http://localhost:3001;http://localhost:4000;http://localhost:5173;http://localhost:8080

# ================================
# 🗄️ DATABASE CONFIGURATION
# ================================
DATABASE_URL=postgresql://livelify_user:livelify_password@localhost:5432/livelify?schema=public

# ================================
# 🚦 RATE LIMITING CONFIGURATION
# ================================
THROTTLE_TTL=60000                    # 1 minute
THROTTLE_LIMIT=100                    # 100 requests per minute
THROTTLE_AUTH_TTL=900000              # 15 minutes
THROTTLE_AUTH_LIMIT=5                 # 5 login attempts per 15 minutes
THROTTLE_STRICT_TTL=60000             # 1 minute
THROTTLE_STRICT_LIMIT=10              # 10 requests per minute
```

### 🧪 QA Configuration (.env.qa)

```env
# ================================
# 🔧 APPLICATION CONFIGURATION
# ================================
NODE_ENV=qa
APP_ENV=qa
APP_DEBUG=false
APP_PORT=3000
APP_PREFIX=api
APP_VERSION=v1

# ================================
# 🔒 SECURITY CONFIGURATION
# ================================
APP_JWT_SECRET=qa-jwt-secret-key-for-testing-should-be-64-chars-minimum-secure
APP_JWT_EXPIRE=30m

# ================================
# 📚 DOCUMENTATION
# ================================
APP_SWAGGER_UI=true
APP_TITLE=Livelify API - QA
APP_DESCRIPTION=Livelify API Application (QA/Testing Environment)

# ================================
# 🌐 CORS CONFIGURATION
# ================================
APP_ALLOWED_ORIGINS=https://qa.livelify.com;https://staging.livelify.com

# ================================
# 🗄️ DATABASE CONFIGURATION
# ================================
DATABASE_URL=postgresql://livelify_qa_user:qa_secure_password@localhost:5432/livelify_qa?schema=public

# ================================
# 🚦 RATE LIMITING CONFIGURATION (More Restrictive)
# ================================
THROTTLE_TTL=60000                    # 1 minute
THROTTLE_LIMIT=50                     # 50 requests per minute
THROTTLE_AUTH_TTL=900000              # 15 minutes
THROTTLE_AUTH_LIMIT=3                 # 3 login attempts per 15 minutes
THROTTLE_STRICT_TTL=60000             # 1 minute
THROTTLE_STRICT_LIMIT=5               # 5 requests per minute
```

### 🚀 Production Configuration (.env.production)

```env
# ================================
# 🔧 APPLICATION CONFIGURATION
# ================================
NODE_ENV=production
APP_ENV=production
APP_DEBUG=false
APP_PORT=3000
APP_PREFIX=api
APP_VERSION=v1

# ================================
# 🔒 SECURITY CONFIGURATION (CRITICAL)
# ================================
APP_JWT_SECRET=REPLACE_WITH_SECURE_PRODUCTION_JWT_SECRET_MINIMUM_64_CHARACTERS_LONG
APP_JWT_EXPIRE=15m

# ================================
# 📚 DOCUMENTATION (DISABLED IN PRODUCTION)
# ================================
APP_SWAGGER_UI=false
APP_TITLE=Livelify API
APP_DESCRIPTION=Livelify API Application (Production)

# ================================
# 🌐 CORS CONFIGURATION (STRICT)
# ================================
APP_ALLOWED_ORIGINS=https://livelify.com;https://www.livelify.com;https://app.livelify.com

# ================================
# 🗄️ DATABASE CONFIGURATION (SECURE)
# ================================
DATABASE_URL=postgresql://PROD_USER:SECURE_PROD_PASSWORD@prod_host:5432/livelify_prod?schema=public&sslmode=require

# ================================
# 🚦 RATE LIMITING CONFIGURATION (Very Restrictive)
# ================================
THROTTLE_TTL=60000                    # 1 minute
THROTTLE_LIMIT=20                     # 20 requests per minute
THROTTLE_AUTH_TTL=900000              # 15 minutes
THROTTLE_AUTH_LIMIT=2                 # 2 login attempts per 15 minutes
THROTTLE_STRICT_TTL=60000             # 1 minute
THROTTLE_STRICT_LIMIT=3               # 3 requests per minute
```

## 🚦 Rate Limiting Configuration Explained

### 📊 Rate Limiting Tiers

| Variable | Description | Dev Value | QA Value | Prod Value |
|----------|-------------|-----------|----------|------------|
| `THROTTLE_TTL` | Default time window (ms) | 60000 (1min) | 60000 (1min) | 60000 (1min) |
| `THROTTLE_LIMIT` | Default requests per window | 100 | 50 | 20 |
| `THROTTLE_AUTH_TTL` | Auth time window (ms) | 900000 (15min) | 900000 (15min) | 900000 (15min) |
| `THROTTLE_AUTH_LIMIT` | Auth attempts per window | 5 | 3 | 2 |
| `THROTTLE_STRICT_TTL` | Strict time window (ms) | 60000 (1min) | 60000 (1min) | 60000 (1min) |
| `THROTTLE_STRICT_LIMIT` | Strict requests per window | 10 | 5 | 3 |

### 🎯 Which Endpoints Use Which Limits

#### 🔐 Auth Rate Limiting (`THROTTLE_AUTH_*`)
- `POST /auth/login` - Login attempts
- `POST /users/register` - User registration

#### 🚨 Strict Rate Limiting (`THROTTLE_STRICT_*`)
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - Logout
- `PUT /users/update` - Profile updates

#### 🌐 Default Rate Limiting (`THROTTLE_*`)
- `GET /users/me` - Profile view
- Other general API endpoints

## 🔧 Docker Compose Configuration

The `docker-compose.yml` file already includes rate limiting variables. To customize for different environments:

### 🛠️ Development (Current Configuration)
```yaml
environment:
  - THROTTLE_TTL=60000
  - THROTTLE_LIMIT=100
  - THROTTLE_AUTH_TTL=900000
  - THROTTLE_AUTH_LIMIT=5
  - THROTTLE_STRICT_TTL=60000
  - THROTTLE_STRICT_LIMIT=10
```

### 🧪 For QA Environment
```yaml
environment:
  - THROTTLE_TTL=60000
  - THROTTLE_LIMIT=50           # More restrictive
  - THROTTLE_AUTH_TTL=900000
  - THROTTLE_AUTH_LIMIT=3       # More restrictive
  - THROTTLE_STRICT_TTL=60000
  - THROTTLE_STRICT_LIMIT=5     # More restrictive
```

### 🚀 For Production Environment
```yaml
environment:
  - THROTTLE_TTL=60000
  - THROTTLE_LIMIT=20           # Very restrictive
  - THROTTLE_AUTH_TTL=900000
  - THROTTLE_AUTH_LIMIT=2       # Very restrictive
  - THROTTLE_STRICT_TTL=60000
  - THROTTLE_STRICT_LIMIT=3     # Very restrictive
```

## 🔄 Environment Switching

### Using Scripts
```bash
# Development
pnpm run start:dev

# QA
pnpm run start:qa

# Production
pnpm run start:prod
```

### Using Docker
```bash
# Development (current docker-compose.yml)
docker-compose up

# For different environments, modify the environment variables in docker-compose.yml
```

## 🧪 Testing Rate Limits

### Manual Testing
```bash
# Test auth rate limiting (should be limited after 5 attempts)
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' \
    -w "Status: %{http_code}\n"
done
```

### Automated Testing
```bash
# Run comprehensive rate limiting tests
./scripts/tests/test_rate_limiting.sh
```

## 🚨 Security Recommendations

### 🔒 Production Security
1. **JWT Secret**: Use a strong, randomly generated secret (minimum 64 characters)
2. **Database**: Use secure connection strings with SSL
3. **CORS**: Restrict to your actual domains only
4. **Rate Limits**: Start with strict limits and adjust based on monitoring

### 📊 Monitoring
1. Monitor rate limit hit rates
2. Set up alerts for unusual patterns
3. Adjust limits based on legitimate usage patterns
4. Log rate limiting violations for security analysis

### 🔄 Best Practices
1. Use different configurations for each environment
2. Test rate limits thoroughly in QA before production
3. Document any custom rate limiting requirements
4. Regularly review and update rate limiting policies

---

*This configuration provides robust protection against API abuse while maintaining good user experience.* 🛡️
