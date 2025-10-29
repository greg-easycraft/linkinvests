# linkinvests

Real estate investment platform - PNPM Monorepo

## Project Structure

```
linkinvests/
├── packages/
│   ├── eslint-config/      # Shared ESLint configuration
│   ├── shared/             # Shared TypeScript types and utilities (no build step)
│   ├── db/                 # Drizzle ORM schemas for PostgreSQL (no build step)
│   ├── frontend/           # Next.js application with Tailwind CSS
│   └── sourcing-worker/    # NestJS worker application
├── specs/                  # Project specifications
├── pnpm-workspace.yaml     # PNPM workspace configuration
├── tsconfig.base.json      # Base TypeScript configuration
├── .prettierrc.json        # Prettier configuration
└── package.json            # Root package with workspace scripts
```

## Technology Stack

- **Package Manager**: PNPM with workspaces
- **Node.js**: >=20.0.0 (LTS)
- **TypeScript**: 5.7+
- **Frontend**: Next.js 15 with React 19, Tailwind CSS
- **Backend Worker**: NestJS 11
- **Database**: PostgreSQL with Drizzle ORM
- **Testing**: Jest
- **Linting**: ESLint with Prettier, TypeScript ESLint, and import sorting

## Packages

### @linkinvests/eslint-config

Shared ESLint configuration used across all packages. Includes:
- TypeScript ESLint
- Prettier integration
- Import sorting rules

### @linkinvests/shared

Pure TypeScript utility types and shared code. No build step - exports raw TypeScript files.

**Usage:**
```typescript
import type { Result, Nullable } from '@linkinvests/shared';
```

### @linkinvests/db

Drizzle ORM package with PostgreSQL schemas. No build step - exports raw TypeScript files.

**Configuration**: `packages/db/drizzle.config.ts`

**Available scripts:**
```bash
pnpm --filter @linkinvests/db db:generate  # Generate migrations
pnpm --filter @linkinvests/db db:migrate   # Run migrations
pnpm --filter @linkinvests/db db:push      # Push schema to database
pnpm --filter @linkinvests/db db:studio    # Open Drizzle Studio
```

**Environment variables** (see `packages/db/.env.example`):
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

### @linkinvests/frontend

Next.js 15 application with App Router, TypeScript, and Tailwind CSS.

**Import alias**: `~/` points to `src/`

**Key features:**
- Server Components by default
- Tailwind CSS for styling
- Imports `@linkinvests/shared` and `@linkinvests/db`

**Scripts:**
```bash
pnpm --filter @linkinvests/frontend dev        # Start dev server
pnpm --filter @linkinvests/frontend build      # Build for production
pnpm --filter @linkinvests/frontend start      # Start production server
pnpm --filter @linkinvests/frontend lint       # Run ESLint
pnpm --filter @linkinvests/frontend typecheck  # Run TypeScript checks
```

### @linkinvests/sourcing-worker

NestJS 11 worker application for real estate sourcing tasks.

**Import alias**: `~/` points to `src/`

**Key features:**
- Uses `@linkinvests/db` for database access
- Uses `@linkinvests/shared` for common types
- Jest configured for unit and e2e tests

**Scripts:**
```bash
pnpm --filter @linkinvests/sourcing-worker dev         # Start in watch mode
pnpm --filter @linkinvests/sourcing-worker build       # Build for production
pnpm --filter @linkinvests/sourcing-worker start:prod  # Start production server
pnpm --filter @linkinvests/sourcing-worker test        # Run unit tests
pnpm --filter @linkinvests/sourcing-worker test:e2e    # Run e2e tests
pnpm --filter @linkinvests/sourcing-worker test:cov    # Run tests with coverage
```

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- PNPM >= 10.18.0
- PostgreSQL (for database)

### Installation

```bash
# Install all dependencies
pnpm install
```

### Development

```bash
# Run all packages in dev mode
pnpm dev

# Or run specific packages
pnpm --filter @linkinvests/frontend dev
pnpm --filter @linkinvests/sourcing-worker dev
```

### Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @linkinvests/frontend build
```

### Type Checking

```bash
# Type check all packages
pnpm typecheck
```

### Linting

```bash
# Lint all packages
pnpm lint
```

### Testing

```bash
# Run tests across all packages
pnpm test
```

## Workspace Scripts

All scripts run across applicable packages in the workspace:

- `pnpm build` - Build all packages
- `pnpm dev` - Start all packages in development mode
- `pnpm lint` - Lint all packages
- `pnpm typecheck` - Type check all packages
- `pnpm test` - Run tests across all packages

## Adding New Dependencies

```bash
# Add to root (workspace-wide dev dependencies)
pnpm add -D <package> -w

# Add to specific package
pnpm --filter @linkinvests/frontend add <package>
pnpm --filter @linkinvests/sourcing-worker add <package>

# Add workspace dependency
# In package.json, use: "@linkinvests/shared": "workspace:*"
```

## Configuration Files

- **TypeScript**: `tsconfig.base.json` (base) → Each package extends this
- **ESLint**: `packages/eslint-config/` → Shared across packages
- **Prettier**: `.prettierrc.json` (root)
- **PNPM**: `pnpm-workspace.yaml`

## Notes

- Both `@linkinvests/shared` and `@linkinvests/db` export raw TypeScript files (no build step)
- Consuming packages (frontend/sourcing-worker) handle transpilation
- Import aliases use `~/` for local imports in frontend and sourcing-worker
- The frontend uses `transpilePackages` in `next.config.ts` for workspace dependencies
