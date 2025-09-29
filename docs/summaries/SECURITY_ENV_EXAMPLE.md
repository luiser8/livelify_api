# 🔒 Security Environment Variables

## Add these variables to your .env files:

### .env.development
```bash
# Basic App Config
APP_ENV=development
APP_PORT=3000
APP_PREFIX=api
APP_VERSION=v1

# Security Config
APP_SECURITY_HSTS_ENABLED=false
APP_SECURITY_CSP_REPORT_URI=
APP_SECURITY_CONTACT=security@livelify.com
APP_SECURITY_RATE_LIMIT=100

# CORS Config
APP_ALLOWED_ORIGINS=http://localhost:3000;http://localhost:3001;http://localhost:8080

# JWT Config (existing)
APP_JWT_SECRET=your-super-secret-jwt-key-min-32-chars
APP_JWT_EXPIRE=1h

# Database (existing)
DATABASE_URL="postgresql://user:password@localhost:5432/livelify?schema=public"
```

### .env.production
```bash
# Basic App Config
APP_ENV=production
APP_PORT=3000
APP_PREFIX=api
APP_VERSION=v1

# Security Config (Stricter in production)
APP_SECURITY_HSTS_ENABLED=true
APP_SECURITY_CSP_REPORT_URI=https://your-domain.com/api/csp-report
APP_SECURITY_CONTACT=security@livelify.com
APP_SECURITY_RATE_LIMIT=60

# CORS Config (Specific domains only)
APP_ALLOWED_ORIGINS=https://your-frontend.com;https://your-app.com

# JWT Config
APP_JWT_SECRET=your-production-super-secret-jwt-key-64-chars-minimum
APP_JWT_EXPIRE=15m

# Database
DATABASE_URL="postgresql://prod_user:prod_password@prod_host:5432/livelify_prod?schema=public"
```

### .env.qa
```bash
# Basic App Config
APP_ENV=qa
APP_PORT=3000
APP_PREFIX=api
APP_VERSION=v1

# Security Config
APP_SECURITY_HSTS_ENABLED=true
APP_SECURITY_CSP_REPORT_URI=https://qa.your-domain.com/api/csp-report
APP_SECURITY_CONTACT=security@livelify.com
APP_SECURITY_RATE_LIMIT=80

# CORS Config
APP_ALLOWED_ORIGINS=https://qa.your-frontend.com;https://staging.your-app.com

# JWT Config
APP_JWT_SECRET=your-qa-secret-jwt-key-for-testing-purposes
APP_JWT_EXPIRE=30m

# Database
DATABASE_URL="postgresql://qa_user:qa_password@qa_host:5432/livelify_qa?schema=public"
```
