# NestJS Starter Project

A modular, production-ready NestJS REST API starter with authentication, mail, and database integration.

## Features

- User authentication with JWT and cookie-based sessions
- Role-based access control (guards & decorators)
- Mailer module using Nodemailer and Pug templates
- Password recovery & email change flows
- Prisma ORM with PostgreSQL
- API documentation via Swagger
- Structured with modules, DTOs, events, listeners
- Ready-to-use Docker setup for dev/prod

## Stack

- **NestJS** + SWC (dev) / tsc (prod)
- **Prisma** + PostgreSQL
- **Vitest** for unit/e2e testing
- **Docker** + Compose
- **Pug** for templated emails

## Project Structure

\`\`\`
src/
├── config/           # Centralized configuration
├── lib/              # Shared utils, DTOs, constants
├── modules/          # Feature modules: auth, users, recovery, etc.
├── templates/        # Email templates
├── main.ts           # Application entrypoint
└── bootstrap.ts      # App bootstrap logic
\`\`\`

## Getting Started

### Prerequisites

- Node.js
- Docker
- PNPM

### Install dependencies

\`\`\`bash
pnpm install
\`\`\`

### Run in development mode

\`\`\`bash
pnpm compose:dev:up
\`\`\`

### Run in production mode

\`\`\`bash
pnpm compose:up
\`\`\`

### Run DB migrations

\`\`\`bash
pnpm exec prisma migrate deploy
\`\`\`

## Testing

\`\`\`bash
pnpm test          # Unit tests
pnpm test:e2e      # End-to-end tests
pnpm test:cov      # Coverage
\`\`\`

## Environment Variables

Create a `.env` file based on `.env.example` with required keys for:
- Database
- Mailer (SMTP)
- JWT/Secrets

## API Docs

Access Swagger UI at: `http://localhost:3000/docs`
Access Scalar reference at: `http://localhost:3000/reference`

---

**Scripts**: See `package.json` for all available scripts including:
- `lint`, `format`, `test:watch`, `compose:*`, etc.
