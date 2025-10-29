# Quick Start Guide

## Initial Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables for database
cp packages/db/.env.example packages/db/.env
# Edit packages/db/.env with your PostgreSQL credentials

# 3. Verify everything works
pnpm typecheck
pnpm build
```

## Running the Applications

### Frontend (Next.js)

```bash
# Development mode
pnpm --filter @linkinvests/frontend dev
# Open http://localhost:3000

# Production build
pnpm --filter @linkinvests/frontend build
pnpm --filter @linkinvests/frontend start
```

### Sourcing Worker (NestJS)

```bash
# Development mode (with hot reload)
pnpm --filter @linkinvests/sourcing-worker dev
# Server runs on http://localhost:3000 by default

# Production
pnpm --filter @linkinvests/sourcing-worker build
pnpm --filter @linkinvests/sourcing-worker start:prod
```

### Run Both Simultaneously

```bash
# In separate terminals
pnpm --filter @linkinvests/frontend dev
pnpm --filter @linkinvests/sourcing-worker dev
```

## Database Management

```bash
# Generate migration from schema changes
pnpm --filter @linkinvests/db db:generate

# Apply migrations to database
pnpm --filter @linkinvests/db db:migrate

# Push schema directly (dev only)
pnpm --filter @linkinvests/db db:push

# Open Drizzle Studio (database GUI)
pnpm --filter @linkinvests/db db:studio
```

## Common Tasks

### Add a new shared type

1. Edit `packages/shared/src/index.ts`
2. Export your new type
3. Use it in frontend or sourcing-worker:
   ```typescript
   import type { YourType } from '@linkinvests/shared';
   ```

### Add a new database table

1. Create schema in `packages/db/src/schema/`
2. Export it from `packages/db/src/schema/index.ts`
3. Generate migration: `pnpm --filter @linkinvests/db db:generate`
4. Apply migration: `pnpm --filter @linkinvests/db db:migrate`

### Add a dependency to a package

```bash
# To frontend
pnpm --filter @linkinvests/frontend add <package-name>

# To sourcing-worker
pnpm --filter @linkinvests/sourcing-worker add <package-name>

# Development dependency
pnpm --filter @linkinvests/frontend add -D <package-name>
```

### Run tests

```bash
# All packages
pnpm test

# Specific package
pnpm --filter @linkinvests/sourcing-worker test
pnpm --filter @linkinvests/sourcing-worker test:e2e
pnpm --filter @linkinvests/sourcing-worker test:cov
```

## Troubleshooting

### Type errors in IDE

1. Restart TypeScript server in your IDE
2. Run `pnpm typecheck` to verify
3. Make sure workspace dependencies are linked: `pnpm install`

### Build fails

1. Clean build artifacts: `rm -rf packages/*/dist packages/*/.next`
2. Reinstall dependencies: `rm -rf node_modules packages/*/node_modules && pnpm install`
3. Run `pnpm build` again

### Database connection issues

1. Verify PostgreSQL is running
2. Check credentials in `packages/db/.env`
3. Ensure database exists: `createdb linkinvests`

## Development Workflow

1. **Start with types**: Add shared types to `@linkinvests/shared`
2. **Define schema**: Add database tables in `@linkinvests/db`
3. **Backend logic**: Implement in `@linkinvests/sourcing-worker`
4. **Frontend UI**: Build interface in `@linkinvests/frontend`
5. **Test**: Write and run tests
6. **Commit**: Stage and commit your changes

## Next Steps

- Review the full [README.md](./README.md)
- Check project specifications in [specs/](./specs/)
- Set up your database and run migrations
- Start building features!
