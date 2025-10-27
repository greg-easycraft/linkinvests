# LinkInvest

Real estate investment platform - PNPM Monorepo

## Project Structure

```
linkinvest/
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

### @linkinvest/eslint-config

Shared ESLint configuration used across all packages. Includes:
- TypeScript ESLint
- Prettier integration
- Import sorting rules

### @linkinvest/shared

Pure TypeScript utility types and shared code. No build step - exports raw TypeScript files.

**Usage:**
```typescript
import type { Result, Nullable } from '@linkinvest/shared';
```

### @linkinvest/db

Drizzle ORM package with PostgreSQL schemas. No build step - exports raw TypeScript files.

**Configuration**: `packages/db/drizzle.config.ts`

**Available scripts:**
```bash
pnpm --filter @linkinvest/db db:generate  # Generate migrations
pnpm --filter @linkinvest/db db:migrate   # Run migrations
pnpm --filter @linkinvest/db db:push      # Push schema to database
pnpm --filter @linkinvest/db db:studio    # Open Drizzle Studio
```

**Environment variables** (see `packages/db/.env.example`):
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

### @linkinvest/frontend

Next.js 15 application with App Router, TypeScript, and Tailwind CSS.

**Import alias**: `~/` points to `src/`

**Key features:**
- Server Components by default
- Tailwind CSS for styling
- Imports `@linkinvest/shared` and `@linkinvest/db`

**Scripts:**
```bash
pnpm --filter @linkinvest/frontend dev        # Start dev server
pnpm --filter @linkinvest/frontend build      # Build for production
pnpm --filter @linkinvest/frontend start      # Start production server
pnpm --filter @linkinvest/frontend lint       # Run ESLint
pnpm --filter @linkinvest/frontend typecheck  # Run TypeScript checks
```

### @linkinvest/sourcing-worker

NestJS 11 worker application for real estate sourcing tasks.

**Import alias**: `~/` points to `src/`

**Key features:**
- Uses `@linkinvest/db` for database access
- Uses `@linkinvest/shared` for common types
- Jest configured for unit and e2e tests

**Scripts:**
```bash
pnpm --filter @linkinvest/sourcing-worker dev         # Start in watch mode
pnpm --filter @linkinvest/sourcing-worker build       # Build for production
pnpm --filter @linkinvest/sourcing-worker start:prod  # Start production server
pnpm --filter @linkinvest/sourcing-worker test        # Run unit tests
pnpm --filter @linkinvest/sourcing-worker test:e2e    # Run e2e tests
pnpm --filter @linkinvest/sourcing-worker test:cov    # Run tests with coverage
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
pnpm --filter @linkinvest/frontend dev
pnpm --filter @linkinvest/sourcing-worker dev
```

### Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @linkinvest/frontend build
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
pnpm --filter @linkinvest/frontend add <package>
pnpm --filter @linkinvest/sourcing-worker add <package>

# Add workspace dependency
# In package.json, use: "@linkinvest/shared": "workspace:*"
```

## Configuration Files

- **TypeScript**: `tsconfig.base.json` (base) → Each package extends this
- **ESLint**: `packages/eslint-config/` → Shared across packages
- **Prettier**: `.prettierrc.json` (root)
- **PNPM**: `pnpm-workspace.yaml`

## Notes

- Both `@linkinvest/shared` and `@linkinvest/db` export raw TypeScript files (no build step)
- Consuming packages (frontend/sourcing-worker) handle transpilation
- Import aliases use `~/` for local imports in frontend and sourcing-worker
- The frontend uses `transpilePackages` in `next.config.ts` for workspace dependencies
