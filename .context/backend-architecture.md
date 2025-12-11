# Backend Architecture

## Overview

This backend follows a **Domain-Driven Design (DDD)** approach with a **Clean Architecture** pattern, built on top of **NestJS** for scalable, modular server-side applications. The architecture emphasizes separation of concerns, testability, and maintainability through well-defined layers and boundaries.

### Technology Stack

- **Framework**: NestJS v11 with Express.js
- **Language**: TypeScript 5.7+
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Better Auth with magic link and admin plugins
- **Validation**: Zod with nestjs-zod integration
- **Email**: Resend for transactional emails
- **Build Tool**: SWC compiler via NestJS CLI

### Monorepo Package Structure

```
packages/
├── api/            # NestJS backend API (@linkinvests/api)
├── app/            # Vite SPA frontend (@linkinvests/app)
├── db/             # Database schema and migrations (@linkinvests/db)
├── shared/         # Shared types, schemas, constants (@linkinvests/shared)
└── worker/         # Background job workers (@linkinvests/worker)
```

## Architecture Layers

### 1. Controller Layer (`/src/domains/*/`)

The controller layer serves as the entry point for HTTP requests and handles request/response processing.

#### Components:
- **Controllers** (`*.controller.ts`): HTTP endpoint handlers with NestJS decorators
- **DTOs**: Request/response schemas imported from `@linkinvests/shared`
- **Validation**: `ZodValidationPipe` from `nestjs-zod` for request validation

#### Key Features:
- **Decorators**: `@Controller()`, `@Get()`, `@Post()`, `@Body()`, `@Param()`
- **Type Safety**: Full end-to-end type safety with TypeScript and Zod
- **Error Handling**: HTTP exceptions mapped from service errors
- **Streaming**: Support for file exports with `StreamableFile`

```typescript
// Example: listings.controller.ts
@Controller('listings')
export class ListingsController {
  constructor(private readonly listingService: ListingService) {}

  @Post('search')
  async search(
    @Body(new ZodValidationPipe(listingFiltersSchema)) filters: ListingFilters,
  ) {
    const result = await this.listingService.getListingsData(filters);
    if (isRefusal(result)) {
      throw new InternalServerErrorException();
    }
    return result.data;
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const result = await this.listingService.getListingById(id);
    if (isRefusal(result)) {
      switch (result.reason) {
        case ListingServiceErrorReason.NOT_FOUND:
          throw new NotFoundException('Listing not found');
        default:
          throw new InternalServerErrorException();
      }
    }
    return result.data;
  }
}
```

### 2. Service Layer (`/src/domains/*/services/`)

The service layer contains business logic and orchestrates operations between controllers and repositories.

#### Components:
- **Services** (`*.service.ts`): Business logic with `@Injectable()` decorator
- **Error Enums**: Domain-specific error reasons
- **Logging**: NestJS `Logger` for structured logging

#### Key Principles:
- **Single Responsibility**: Each service handles one domain concern
- **Error Handling**: Standardized `OperationResult<T, E>` pattern
- **Dependency Injection**: Services receive repositories via constructor injection

```typescript
// Example: listing.service.ts
export enum ListingServiceErrorReason {
  NOT_FOUND = 'NOT_FOUND',
  EXPORT_LIMIT_EXCEEDED = 'EXPORT_LIMIT_EXCEEDED',
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

@Injectable()
export class ListingService {
  private readonly logger = new Logger(ListingService.name);

  constructor(
    private readonly listingRepository: ListingRepository,
    private readonly exportService: ExportService,
  ) {}

  async getListingById(
    id: string,
  ): Promise<OperationResult<Listing, ListingServiceErrorReason>> {
    try {
      const listing = await this.listingRepository.findById(id);
      if (!listing) {
        return refuse(ListingServiceErrorReason.NOT_FOUND);
      }
      return succeed(listing);
    } catch (error) {
      this.logger.error('Failed to get listing by id', error);
      return refuse(ListingServiceErrorReason.UNKNOWN_ERROR);
    }
  }
}
```

### 3. Repository Layer (`/src/domains/*/repositories/`)

Handles all database interactions with abstract interfaces and concrete implementations.

#### Components:
- **Abstract Repository** (`lib.types.ts`): Interface defining data access contract
- **Concrete Implementation** (`*.repository.ts`): Drizzle ORM implementation
- **Query Builders**: Complex SQL building with filters

#### Features:
- **Dependency Inversion**: Services depend on abstract repository interfaces
- **Type Safety**: Full TypeScript integration with Drizzle ORM
- **Pagination**: Standardized pagination with limit/offset
- **Filtering**: Dynamic query building with Drizzle operators

```typescript
// Abstract interface (lib.types.ts)
export abstract class ListingRepository {
  abstract findAll(
    filters?: IListingFilters,
    paginationFilters?: PaginationFilters,
  ): Promise<Listing[]>;
  abstract findById(id: string): Promise<Listing | null>;
  abstract count(filters?: IListingFilters): Promise<number>;
  abstract getDistinctSources(): Promise<string[]>;
}

// Concrete implementation (listing.repository.ts)
@Injectable()
export class DrizzleListingRepository extends ListingRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: DomainDbType) {
    super();
  }

  async findById(id: string): Promise<Listing | null> {
    const result = await this.db
      .select()
      .from(opportunityListings)
      .where(eq(opportunityListings.id, id))
      .limit(1);

    return result[0] ? this.mapListing(result[0]) : null;
  }
}
```

### 4. Common/Infrastructure Layer (`/src/common/`)

Cross-cutting concerns and shared infrastructure modules.

#### Components:
- **AuthModule** (`auth/`): Better Auth integration with magic link and admin plugins
- **ConfigModule** (`config/`): Environment validation with Zod
- **DatabaseModule** (`database/`): Global database connection provider
- **EmailModule** (`email/`): Resend email service
- **ExportModule** (`export/`): CSV/XLSX export functionality

## Domain Organization

### Current Domains

```
src/domains/
├── listings/           # Real estate listings
├── auctions/           # Auction opportunities
├── successions/        # Succession opportunities
├── liquidations/       # Liquidation opportunities
├── energy-diagnostics/ # Energy diagnostic reports (DPE)
└── addresses/          # Address search with Fuse.js
```

#### Standard Domain Structure

```
domains/{domain}/
├── index.ts                  # Public exports
├── lib.types.ts              # Abstract repository interface
├── {domain}.module.ts        # NestJS module definition
├── {domain}.controller.ts    # HTTP endpoints
├── {domain}.controller.spec.ts # Controller tests
├── services/
│   ├── {domain}.service.ts      # Business logic
│   ├── {domain}.service.spec.ts # Service tests
│   └── index.ts
└── repositories/
    ├── {domain}.repository.ts        # Drizzle ORM implementation
    ├── {domain}.repository.e2e-spec.ts # E2E tests
    └── index.ts
```

## Dependency Injection

NestJS uses a built-in dependency injection system with decorators and modules.

### Module-based Registration

```typescript
// listings.module.ts
@Module({
  controllers: [ListingsController],
  providers: [
    {
      provide: ListingRepository,
      useClass: DrizzleListingRepository,
    },
    ListingService,
  ],
  exports: [ListingService, ListingRepository],
})
export class ListingsModule {}
```

### Token-based Injection

For infrastructure dependencies like database connections:

```typescript
// database.module.ts
export const DATABASE_TOKEN = Symbol('DATABASE');

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_TOKEN,
      useFactory: (config: ConfigType) => {
        const client = postgres(config.DATABASE_URL);
        return drizzle(client, { schema });
      },
      inject: [CONFIG_TOKEN],
    },
  ],
  exports: [DATABASE_TOKEN],
})
export class DatabaseModule {}

// In repository
@Injectable()
export class DrizzleListingRepository extends ListingRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: DomainDbType) {
    super();
  }
}
```

### App Module Composition

```typescript
// app.module.ts
@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    AuthModule,
    EmailModule,
    ExportModule,
    AuctionsModule,
    ListingsModule,
    SuccessionsModule,
    LiquidationsModule,
    EnergyDiagnosticsModule,
    AddressesModule,
  ],
})
export class AppModule {}
```

## Key Design Patterns

### 1. Repository Pattern

```typescript
// Abstract interface
export abstract class ListingRepository {
  abstract findAll(filters?: IListingFilters): Promise<Listing[]>;
  abstract findById(id: string): Promise<Listing | null>;
}

// Concrete implementation
@Injectable()
export class DrizzleListingRepository extends ListingRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: DomainDbType) {
    super();
  }
  // Implementation details...
}
```

### 2. Service Pattern

```typescript
@Injectable()
export class ListingService {
  constructor(
    private readonly listingRepository: ListingRepository,
    private readonly exportService: ExportService,
  ) {}

  async getListingById(id: string): Promise<OperationResult<Listing, ListingServiceErrorReason>> {
    // Business logic and error handling
  }
}
```

### 3. Result Pattern

```typescript
type OperationSuccess<T> = { success: true; data: T };
type OperationFailure<R> = { success: false; reason: R };
export type OperationResult<T, E> = OperationSuccess<T> | OperationFailure<E>;

// Helper functions
export function succeed<T>(data: T): OperationSuccess<T> {
  return { success: true, data };
}

export function refuse<E>(reason: E): OperationFailure<E> {
  return { success: false, reason };
}

export function isSuccess<T, E>(result: OperationResult<T, E>): result is OperationSuccess<T> {
  return result.success;
}

export function isRefusal<T, E>(result: OperationResult<T, E>): result is OperationFailure<E> {
  return !result.success;
}
```

### 4. Error Handling in Controllers

```typescript
@Get(':id')
async getById(@Param('id') id: string) {
  const result = await this.listingService.getListingById(id);
  if (isRefusal(result)) {
    switch (result.reason) {
      case ListingServiceErrorReason.NOT_FOUND:
        throw new NotFoundException('Listing not found');
      case ListingServiceErrorReason.EXPORT_LIMIT_EXCEEDED:
        throw new BadRequestException('Export limit exceeded');
      default:
        throw new InternalServerErrorException();
    }
  }
  return result.data;
}
```

## Authentication Layer

### Better Auth Configuration

```typescript
// auth.ts
export const auth = betterAuth({
  basePath: '/api/auth',
  secret: config.BETTER_AUTH_SECRET,
  baseURL: config.BETTER_AUTH_URL,

  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),

  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await resend.emails.send({
          from: 'App <noreply@example.com>',
          to: email,
          subject: 'Sign in',
          html: `<a href="${url}">Sign in</a>`,
        });
      },
      expiresIn: 600, // 10 minutes
      disableSignUp: true,
    }),
    admin({
      defaultRole: 'user',
      adminRoles: ['admin'],
    }),
  ],

  socialProviders: {
    google: {
      clientId: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache for 5 minutes
    },
  },

  user: {
    additionalFields: {
      role: { type: 'string', defaultValue: 'user', input: false },
      banned: { type: 'boolean', defaultValue: false, input: false },
      banReason: { type: 'string', input: false },
      banExpires: { type: 'date', input: false },
    },
  },
});
```

### NestJS Integration

```typescript
// auth.module.ts
import { BetterAuthModule } from '@thallesp/nestjs-better-auth';

@Module({
  imports: [
    BetterAuthModule.forRoot({
      auth,
      globalGuard: false, // Selective route protection
    }),
  ],
})
export class AuthModule {}
```

## Data Access Layer

### Database Module

```typescript
// database.module.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@linkinvests/db';

export const DATABASE_TOKEN = Symbol('DATABASE');

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_TOKEN,
      useFactory: (config: ConfigType) => {
        const client = postgres(config.DATABASE_URL);
        return drizzle(client, { schema });
      },
      inject: [CONFIG_TOKEN],
    },
  ],
  exports: [DATABASE_TOKEN],
})
export class DatabaseModule {}
```

### Database Type Definition

```typescript
// types/db.ts
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type * as schema from '@linkinvests/db';

export type DomainDbType = PostgresJsDatabase<typeof schema>;
```

## Configuration

### Environment Validation

```typescript
// config/index.ts
import { z } from 'zod';

const configSchema = z.object({
  PORT: z.number().default(8080),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  DATABASE_URL: z.string(),
  RESEND_API_KEY: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string(),
  FRONTEND_URL: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
});

export const config = configSchema.parse({
  ...process.env,
  PORT: process.env.PORT ? parseInt(process.env.PORT) : 8080,
});

export const CONFIG_TOKEN = Symbol('CONFIG');
export type ConfigType = z.infer<typeof configSchema>;

@Global()
@Module({
  providers: [{ provide: CONFIG_TOKEN, useValue: config }],
  exports: [CONFIG_TOKEN],
})
export class ConfigModule {}
```

## Bootstrap

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from './common/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.enableCors({
    origin: config.FRONTEND_URL,
    credentials: true,
  });

  await app.listen(config.PORT);
}
bootstrap();
```

## Testing Strategy

### Unit Testing

- **Location**: `*.spec.ts` files alongside source files
- **Framework**: Jest with ts-jest
- **Pattern**: Mock repositories for service testing

```typescript
// listing.service.spec.ts
describe('ListingService', () => {
  let service: ListingService;
  let mockRepository: jest.Mocked<ListingRepository>;

  beforeEach(async () => {
    mockRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      count: jest.fn(),
      getDistinctSources: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        ListingService,
        { provide: ListingRepository, useValue: mockRepository },
        { provide: ExportService, useValue: mockExportService },
      ],
    }).compile();

    service = module.get<ListingService>(ListingService);
  });

  it('should return not found for non-existent listing', async () => {
    mockRepository.findById.mockResolvedValue(null);
    const result = await service.getListingById('non-existent');
    expect(isRefusal(result)).toBe(true);
    expect(result.reason).toBe(ListingServiceErrorReason.NOT_FOUND);
  });
});
```

### E2E Testing

- **Location**: `*.e2e-spec.ts` files
- **Framework**: Jest with supertest
- **Database**: Test database with fixtures

```typescript
// listing.repository.e2e-spec.ts
describe('DrizzleListingRepository (E2E)', () => {
  let repository: DrizzleListingRepository;
  let db: DomainDbType;

  beforeAll(async () => {
    db = await setupTestDatabase();
    repository = new DrizzleListingRepository(db);
    await seedTestData(db);
  });

  afterAll(async () => {
    await cleanupTestDatabase(db);
  });

  it('should find listing by id', async () => {
    const listing = await repository.findById('test-listing-id');
    expect(listing).toBeDefined();
    expect(listing?.id).toBe('test-listing-id');
  });
});
```

## Shared Package Integration

### Types and Schemas

```typescript
// Importing from @linkinvests/shared
import {
  listingFiltersSchema,
  type ListingFilters,
  type Listing,
  OpportunityType,
  PropertyType,
  EnergyClass,
} from '@linkinvests/shared';
```

### Database Schema

```typescript
// Importing from @linkinvests/db
import { opportunityListings, users, sessions, accounts, verifications } from '@linkinvests/db';
```

## Development Workflow

### Adding New Domains

1. Create domain folder under `/src/domains/`
2. Define repository interface (`lib.types.ts`)
3. Implement repository class with `@Injectable()` and `@Inject(DATABASE_TOKEN)`
4. Create service class with business logic
5. Create controller with HTTP endpoints
6. Create NestJS module with providers and exports
7. Import module in `app.module.ts`
8. Write unit and E2E tests

### Best Practices

#### Core Patterns
- Always use the `OperationResult` pattern for error handling
- Implement repository interfaces before concrete implementations
- Use NestJS dependency injection for testability
- Follow the existing naming conventions
- Add proper TypeScript types for all new entities
- Include comprehensive error handling and logging

#### Domain Isolation
- Domains should be self-contained with minimal cross-domain dependencies
- Use shared types from `@linkinvests/shared` for common interfaces
- Repository implementations should only access their domain's tables

#### Controller Guidelines
- Use `ZodValidationPipe` for request body validation
- Map service errors to appropriate HTTP exceptions
- Keep controllers thin - delegate business logic to services

#### Service Guidelines
- Services should focus on business logic
- Use `succeed()` and `refuse()` helpers for result pattern
- Log errors with NestJS Logger

#### Testing Guidelines
- Write unit tests for services with mocked repositories
- Write E2E tests for repositories with test database
- Use NestJS `Test.createTestingModule()` for dependency injection in tests

## Scripts

```bash
# Development
pnpm start:dev          # Start with watch mode
pnpm start:debug        # Start with debug mode

# Production
pnpm build              # Build with NestJS CLI
pnpm start:prod         # Start production server

# Testing
pnpm test               # Run unit tests
pnpm test:watch         # Run tests in watch mode
pnpm test:cov           # Run tests with coverage
pnpm test:e2e           # Run E2E tests

# Code Quality
pnpm typecheck          # TypeScript type checking
pnpm lint               # ESLint with auto-fix
pnpm format             # Prettier formatting
```
