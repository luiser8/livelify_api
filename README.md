# README #

This README would normally document whatever steps are necessary to get your application up and running.

### What is this repository for? ###

* Quick summary
* Version
* [Learn Markdown](https://bitbucket.org/tutorials/markdowndemo)

### How do I get set up? ###

#### Prerequisites

* Node.js (v18 or higher)
* pnpm
* Docker & Docker Compose

#### Environment Setup

```bash
# Copy environment files (if available)
pnpm env:copy:dev
# or manually create .env.development file
```

#### Quick Start (Recommended)

```bash
# 1. Start Docker services
docker-compose up -d

# 2. Install dependencies
pnpm install

# 3. Setup database (generates Prisma client, runs migrations, and seeds data)
pnpm db:setup:dev

# 4. Start development server
pnpm start:dev
```

#### Manual Setup

If you prefer to run each step manually:

##### Docker

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down
```

##### Database Setup

```bash
# Generate Prisma client
pnpm prisma:generate:dev

# Run database migrations
pnpm prisma:migrate:dev

# Seed database with initial data
pnpm prisma:seed:dev
```

##### Development Server

```bash
# Start in development mode (with file watching)
pnpm start:dev

# Start with debugging enabled
pnpm start:debug

# Start for QA environment
pnpm start:qa
```

#### Useful Development Commands

##### Database Management

```bash
# Open Prisma Studio (database GUI)
pnpm prisma:studio:dev

# Reset database (⚠️ This will delete all data)
pnpm prisma:reset:dev

# Deploy migrations to production
pnpm prisma:deploy:prod
```

##### Code Quality

```bash
# Format code
pnpm format

# Run linter
pnpm lint

# Build application
pnpm build
```

##### Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:cov

# Run e2e tests
pnpm test:e2e
```

#### Environment Commands

The project supports multiple environments (development, qa, production):

* Use `dev` suffix for development
* Use `qa` suffix for QA environment
* Use `prod` suffix for production

### Contribution guidelines ###

* Writing tests
* Code review
* Other guidelines

### Who do I talk to? ###

* Repo owner or admin
* Other community or team contact
