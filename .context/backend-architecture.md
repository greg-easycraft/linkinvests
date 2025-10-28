# Backend Architecture

## Overview

This backend follows a **Domain-Driven Design (DDD)** approach with a **Clean Architecture** pattern, built on top of **Next.js Server Actions** for type-safe server operations. The architecture emphasizes separation of concerns, testability, and maintainability through well-defined layers and boundaries.

## Architecture Layers

### 1. Server Actions Layer (`/src/app/_actions/`)

The Server Actions layer serves as the entry point for client requests and handles server-side operations.

#### Components:
- **Server Actions** (`queries.ts`, `mutations.ts`): Domain-specific server functions marked with `'use server'`
- **Shared Utilities** (`shared/`): Auth helpers, error handling, response utilities, and revalidation functions
- **Domain Organization**: Actions organized by domain (admin/, project/, company/, etc.)

#### Key Features:
- **Type Safety**: Full end-to-end type safety between client and server with TypeScript
- **Authentication Helpers**: Reusable auth functions (`requireAuth()`, `requireAdmin()`, `getSession()`)
- **Error Handling**: Standardized error formatting with ServerActionError class
- **Cache Revalidation**: Next.js cache revalidation after mutations

### 2. Domain Layer (`/src/server/domains/`)

The domain layer contains business logic organized by domain contexts (currently `profile`, `project`, `company`).

#### Components:
- **Services**: Orchestrate business operations and enforce business rules
- **Repositories**: Define data access interfaces (abstract contracts)
- **Repository Implementations**: Concrete implementations using Drizzle ORM

#### Architecture Pattern:
```
Server Actions → Service → Repository → Database
```

#### Key Principles:
- **Dependency Inversion**: Services depend on repository interfaces, not implementations
- **Single Responsibility**: Each service handles one domain concern
- **Error Handling**: Standardized `OperationResult<T, E>` pattern for predictable error handling
- **Dependency Injection**: Container-based DI with Awilix for service resolution

### 3. Data Access Layer (`/src/server/db/`)

Handles all database interactions and schema definitions.

#### Components:
- **Database Connection** (`index.ts`): Singleton connection with development caching
- **Schema Definition** (`schema.ts`): Drizzle schema with relations and constraints
- **Type Exports**: Database types for repository implementations

#### Features:
- **Connection Pooling**: Postgres connection with HMR-safe caching
- **Schema Organization**: Logical separation between auth and business domain models
- **Type Safety**: Full TypeScript integration with Drizzle ORM
- **Relational Modeling**: Proper foreign key relationships and indexes

### 4. Authentication Layer (`/src/server/auth/`)

Centralized authentication and authorization handling.

#### Components:
- **NextAuth Configuration** (`config.ts`): OAuth providers and conversation management
- **Conversation Management**: Drizzle adapter integration
- **Type Augmentation**: Custom user type extensions

## Domain Organization

### Current Domains

#### Profile Domain (`/src/server/domains/profile/`)
Handles user profile management and administrative user operations.

**Services:**
- `AdminProfileService`: Administrative profile operations (CRUD + block/unblock)

**Repositories:**
- `AdminProfileRepository` / `DrizzleAdminProfileRepository`: Admin profile operations

#### Project Domain (`/src/server/domains/project/`)
Handles project management and project-related operations.

**Services:**
- `ProjectService`: Project operations with access control

**Repositories:**
- `ProjectRepository` / `DrizzleProjectRepository`: Project data access

#### Company Domain (`/src/server/domains/company/`)
Handles company management and company-related operations.

**Services:**
- `CompanyService`: Company operations

**Repositories:**
- `CompanyRepository` / `DrizzleCompanyRepository`: Company data access

## Import Rules and Domain Isolation

### Domain Boundaries
Domains are completely isolated from each other to maintain clear boundaries and prevent circular dependencies.

#### Strict Import Rules
1. **Domain Isolation**: Domains MUST NOT import from other domains
2. **Repository Boundaries**: Repository implementations may only import from `~/server/db`
3. **Service Dependencies**: Services may only depend on repositories within their own domain
4. **Shared Dependencies**: All domains may import from:
   - `~/types/*` - Shared type definitions (including `~/types/other-domain`)
   - `~/constants/*` - Validation schemas and constants
   - `~/utils/*` - Utility functions
   - `~/server/db` - Database connection and schema (repositories only)
5. **Cross-Domain Types**: Domains may import types from other domains via `~/types/other-domain`

#### Cross-Domain Type Sharing
Domains may share types through the `~/shared/types/` directory structure:

```typescript
// ✅ Correct: Import types from other domains via ~/shared/types/
// src/server/domains/project/lib.types.ts
import type { UserProfile } from '~/shared/types/profile';
import type { ProjectCreateInput } from '~/shared/validation/projects';

export interface ProfileRepository {
  getProfileById(id: string): Promise<UserProfile | null>;
}

// ✅ Correct: Domain-specific repository implementation
// src/server/domains/project/repositories/profile.repository.ts
import type { UserProfile } from '~/shared/types/profile';
import type { ProfileRepository } from '../lib.types';

export class DrizzleProfileRepository implements ProfileRepository {
  // Implementation specific to project domain needs
}

// ❌ Incorrect: Direct domain import
import type { UserProfile } from '~/server/domains/profile/lib.types';
```

#### Cross-Domain Data Access
When a domain needs data from another domain, it MUST:
1. **Create Own Repository**: Implement its own repository interface and implementation
2. **Define Required Methods**: Only include methods actually needed by the domain
3. **No Shared Implementations**: Each domain owns its repository implementations
4. **Use Shared Types**: Import required types from `~/shared/types/other-domain`

```typescript
// ✅ Correct: Project domain creates its own profile repository
// src/server/domains/project/lib.types.ts
export interface ProfileRepository {
  getProfileById(id: string): Promise<UserProfile | null>;
}

// src/server/domains/project/repositories/profile.repository.ts
export class DrizzleProfileRepository implements ProfileRepository {
  constructor(private readonly db: DbType) {}

  async getProfileById(id: string): Promise<UserProfile | null> {
    // Implementation specific to project domain needs
  }
}

// ❌ Incorrect: Importing from another domain
import { DrizzleProfileRepository } from '~/server/domains/profile';
```

#### Service Simplification
Services should focus on their core domain responsibilities:

```typescript
// ✅ Correct: Simplified service focused on domain logic
export class AdminProfileService {
  constructor(private readonly adminProfileRepository: AdminProfileRepository) {}

  async getProfileById(id: string) {
    const profile = await this.adminProfileRepository.getProfileById(id);
    if (!profile) return refuse(AdminProfileServiceError.PROFILE_NOT_FOUND);
    return succeed(profile);
  }
}

// ❌ Incorrect: Service with cross-domain dependencies
export class AdminProfileService {
  constructor(
    private readonly adminProfileRepository: AdminProfileRepository,
    private readonly projectRepository: ProjectRepository // Cross-domain import
  ) {}
}
```

#### Server Actions Simplification
Server Actions should delegate validation to their respective services:

```typescript
// ✅ Correct: Server Action trusts service layer validation
// src/app/_actions/admin/profile/queries.ts
'use server';

export async function getProfileById(id: string) {
  await requireAdmin();
  const service = profileContainer.resolve('adminProfileService');
  const result = await service.getProfileById(id);
  return unwrapResult(result);
}

// ❌ Incorrect: Server Action doing cross-domain validation
'use server';

export async function createProfile(data: ProfileCreateInput) {
  await requireAdmin();

  // Server Action shouldn't validate company existence - service responsibility
  const companyService = companyContainer.resolve('companyService');
  const company = await companyService.getById(data.companyId);
  if (!company) throw new Error('Company not found');

  const profileService = profileContainer.resolve('adminProfileService');
  const result = await profileService.createProfile(data);
  return unwrapResult(result);
}
```

## Key Design Patterns

### 1. Repository Pattern
```typescript
// Abstract interface
export interface ProfileRepository {
    getAllProfiles(): Promise<UserWithStatus[]>;
    getProfileById(id: string): Promise<UserProfile | null>;
}

// Concrete implementation
export class DrizzleAdminProfileRepository implements AdminProfileRepository {
    constructor(private readonly db: DomainDbType) {}
    // Implementation details...
}
```

### 2. Service Pattern
```typescript
export class AdminProfileService {
    constructor(
        private readonly adminProfileRepository: AdminProfileRepository
    ) {}

    async getProfileById(id: string): Promise<OperationResult<UserWithStatus, AdminProfileServiceError>> {
        // Business logic and error handling
    }
}
```

### 3. Result Pattern
```typescript
type OperationResult<T, E> = OperationSuccess<T> | OperationFailure<E>;

// Usage
const result = await adminProfileService.getProfileById(id);
if (isSuccess(result)) {
    return result.data; // Type-safe access
}
throw new Error(result.reason); // Type-safe error handling
```

### 4. Dependency Injection Architecture

The backend uses **Container-based Dependency Injection** with Awilix for all service and repository management. This approach provides better testability, maintainability, and supports complex dependency graphs.

#### Container-based Dependency Injection
```typescript
// Using Awilix container for dependency management
import { profileContainer } from '~/server/di';
import { requireAdmin } from '../shared/auth';
import { unwrapResult } from '../shared/response';

// In Server Actions
export async function getAllProfiles() {
  await requireAdmin();
  const service = profileContainer.resolve('adminProfileService');
  const result = await service.getAllProfiles();
  return unwrapResult(result);
}

// Services are resolved directly from containers in Server Actions
export async function createProfile(data: UserProfileCreationInput) {
  await requireAdmin();
  const service = profileContainer.resolve('adminProfileService');
  const result = await service.createProfile(data);
  const profile = await unwrapResult(result);
  revalidateUsers();
  return profile;
}
```

### 5. Admin/User Service Separation
```typescript
// User-facing service with access restrictions
export class ProjectService {
    async getProjectById({id, userId, userRole}: {id: string, userId: string, userRole: UserRole}) {
        // Business logic: Check existence first
        const project = await this.projectRepository.getProjectById(id);
        if (!project) return refuse(ProjectServiceError.PROJECT_NOT_FOUND);

        // Business logic: Check access permissions
        if (userRole !== UserRole.ADMIN && project.ownerId !== userId) {
            return refuse(ProjectServiceError.ACCESS_DENIED);
        }
        return succeed(project);
    }
}

// Admin service with full access
export class AdminProjectService {
    async getProjectById(id: string) {
        const project = await this.projectRepository.getProjectById(id);
        if (!project) return refuse(AdminProjectServiceError.PROJECT_NOT_FOUND);
        return succeed(project);
    }
}
```

### 6. Business Logic Access Patterns
```typescript
// Pattern: Always check existence before access control
async updateProject({id, userId, updateData}) {
    // 1. Check if resource exists (business logic)
    const existingProject = await this.projectRepository.getProjectById(id);
    if (!existingProject) {
        return refuse(ProjectServiceError.PROJECT_NOT_FOUND);
    }

    // 2. Check access permissions (business logic)
    if (existingProject.ownerId !== userId) {
        return refuse(ProjectServiceError.ACCESS_DENIED);
    }

    // 3. Perform operation
    const project = await this.projectRepository.updateProject({id, userId, updateData});
    return succeed(project);
}
```

### 7. Repository Interface Unification
Both user and admin repositories can implement similar method signatures for consistency:

```typescript
// Both repositories have getProjectById, but different access patterns
export interface ProjectRepository {
  getProjectById(id: string): Promise<Project | null>; // No user filtering in interface
  updateProject(params: {id: string, userId: string, updateData: ProjectUpdateInput}): Promise<Project | null>;
}

export interface AdminProjectRepository {
  getProjectById(id: string): Promise<Project | null>; // Same signature
  updateProject(params: {id: string, updateData: ProjectUpdateInput}): Promise<Project | null>; // No userId required
}
```

### 8. Service Responsibility Boundaries
Services should only handle their domain's core business logic:

```typescript
// ✅ Correct: Service focused on profile operations
export class AdminProfileService {
  async deleteProfile(id: string) {
    const existingProfile = await this.adminProfileRepository.getProfileById(id);
    if (!existingProfile) return refuse(AdminProfileServiceError.PROFILE_NOT_FOUND);

    const success = await this.adminProfileRepository.deleteProfile(id);
    return succeed(success);
  }
}

// ❌ Incorrect: Service handling cross-domain validation
export class AdminProfileService {
  async createProfile({profileData, companyId}) {
    // This should not be the profile service's responsibility
    const company = await this.companyRepository.getCompanyById(companyId);
    if (!company) return refuse(AdminProfileServiceError.COMPANY_NOT_FOUND);
    // ...
  }
}
```

### 9. Container-based Dependency Injection

The backend uses **Container-based Dependency Injection** with Awilix as the standard approach for all service and repository management. This provides consistent dependency management, better testability, and supports complex dependency graphs across all domains.

#### Container-based DI Implementation

**Container Location and Organization:**
All DI containers are centralized in `/src/server/di/` to maintain proper domain boundaries and avoid importing database code into domain folders.

**Container Naming Convention:**
- One container per domain: `{domain}.container.ts`
- Export pattern: `export const {domain}Container = createContainer<{Domain}ContainerType>()`

**Container Configuration:**
```typescript
// src/server/di/profile.container.ts
import { asFunction, createContainer } from 'awilix';
import { domainDb, type DomainDbType } from '~/server/db';
import { AdminProfileService, DrizzleAdminProfileRepository } from '~/server/domains/profile';

interface ProfileContainerType {
  db: DomainDbType;
  adminProfileRepository: DrizzleAdminProfileRepository;
  adminProfileService: AdminProfileService;
}

export const profileContainer = createContainer<ProfileContainerType>();

// Register database as singleton
profileContainer.register({
  db: asFunction(() => domainDb).singleton(),
});

// Register repositories with scoped lifetime
profileContainer.register({
  adminProfileRepository: asFunction(() =>
    new DrizzleAdminProfileRepository(profileContainer.resolve('db'))
  ).scoped(),
});

// Register services with scoped lifetime
profileContainer.register({
  adminProfileService: asFunction(() => new AdminProfileService(
    profileContainer.resolve('adminProfileRepository')
  )).scoped(),
});
```

**Lifetime Management:**
- **Singleton**: Database connections, shared resources
- **Scoped**: Services and repositories (new instance per request)
- **Transient**: Not used (scoped provides better performance)

**Server Actions Integration:**
```typescript
// Import container from centralized DI location
import { profileContainer } from '~/server/di';
import { requireAdmin } from '../shared/auth';
import { unwrapResult } from '../shared/response';
import { revalidateUsers } from '../shared/revalidate';

// Server Action with direct service resolution
export async function createProfile(data: UserProfileCreationInput) {
  await requireAdmin();
  const service = profileContainer.resolve('adminProfileService');
  const result = await service.createProfile({
    name: data.name,
    email: data.email,
    role: data.role ?? UserRole.USER,
    image: data.image ?? null,
  });
  const profile = await unwrapResult(result);
  revalidateUsers();
  return profile;
}
```

#### DI Principles and Best Practices

**1. Container Location and Domain Boundaries:**
- **Centralized Containers**: All containers live in `/src/server/di/` to maintain domain boundaries
- **No Database Imports in Domains**: Domain folders should not import database code directly
- **Container per Domain**: Each domain has its own dedicated container file
- **Import Pattern**: Server Actions import containers from `~/server/di`, not from domain folders

**2. Dependency Resolution Order:**
- Register dependencies before dependents
- Use factory functions to avoid circular dependencies
- Database connection registered first as singleton

**3. Service Composition:**
- Services can depend on multiple repositories
- Services should not depend on other services (domain isolation)
- Use container resolution for all service graphs

**4. Testing Integration:**
- Container supports easy mocking for tests
- Scoped lifetime ensures test isolation
- Factory functions enable dependency substitution

**5. Performance Considerations:**
- Singleton for expensive resources (database connections)
- Scoped for request-specific instances (services, repositories)
- Lazy resolution through factory functions

**6. Type Safety:**
- Container type definitions ensure compile-time safety
- Service interfaces provide clear contracts
- TypeScript inference works with container resolution

**7. Server Actions Integration:**
- Resolve services directly from containers in Server Actions
- Use auth helpers (`requireAuth()`, `requireAdmin()`) for authentication
- Maintain clean separation between DI and business logic

#### Container Registration Pattern

**Standard registration approach:**
```typescript
// src/server/di/profile.container.ts
import { asFunction, createContainer } from 'awilix';
import { domainDb, type DomainDbType } from '~/server/db';
import { AdminProfileService, DrizzleAdminProfileRepository } from '~/server/domains/profile';

interface ProfileContainerType {
  db: DomainDbType;
  adminProfileRepository: DrizzleAdminProfileRepository;
  adminProfileService: AdminProfileService;
}

export const profileContainer = createContainer<ProfileContainerType>();

// Register database as singleton
profileContainer.register({
  db: asFunction(() => domainDb).singleton(),
});

// Register repositories with scoped lifetime
profileContainer.register({
  adminProfileRepository: asFunction(() =>
    new DrizzleAdminProfileRepository(profileContainer.resolve('db'))
  ).scoped(),
});

// Register services with scoped lifetime
profileContainer.register({
  adminProfileService: asFunction(() => new AdminProfileService(
    profileContainer.resolve('adminProfileRepository')
  )).scoped(),
});
```

**Container Index File:**
```typescript
// src/server/di/index.ts
export * from './company.container';
export * from './file-storage.container';
export * from './profile.container';
export * from './project.container';
```

#### DI Directory Structure

**Centralized Container Organization:**
```
src/server/di/
├── index.ts                    # Export all containers
├── company.container.ts        # Company domain container
├── file-storage.container.ts   # File storage container
├── profile.container.ts        # Profile domain container
├── project.container.ts        # Project domain container
├── company.container.spec.ts   # Company container tests
├── file-storage.container.spec.ts  # File storage container tests
├── profile.container.spec.ts   # Profile container tests
└── project.container.spec.ts   # Project container tests
```

**Benefits of Centralized Containers:**
- **Domain Boundary Enforcement**: Prevents database imports in domain folders
- **Consistent DI Management**: All containers in one location
- **Easy Testing**: Centralized container testing
- **Clear Dependencies**: Explicit container dependencies visible
- **Maintainability**: Single location for DI configuration changes

## Security Architecture

### Authentication Flow
1. **OAuth Integration**: Google OAuth via NextAuth.js
2. **Conversation Management**: Database-backed conversations with Drizzle adapter
3. **Role-Based Access**: User roles (USER, ADMIN) enforced at procedure level
4. **Request Context**: Conversation and user data available in all procedures

### Authorization Levels
- **Public**: Unauthenticated access
- **Protected**: Requires valid conversation
- **Admin**: Requires admin role

### Business Logic Rules

#### Access Control Patterns
1. **Existence Check First**: Always verify resource existence before checking access permissions
2. **Service-Level Authorization**: Business logic for access control resides in services, not repositories
3. **Transparent Error Handling**: Distinguish between "not found" and "access denied" errors
4. **Admin Bypass**: Admin users can access resources regardless of ownership

#### Implementation Rules
```typescript
// ✅ Correct: Check existence then access
async getResource({id, userId, userRole}) {
    const resource = await this.repository.getById(id); // No user filtering
    if (!resource) return refuse(ServiceError.NOT_FOUND);
    
    if (userRole !== UserRole.ADMIN && resource.userId !== userId) {
        return refuse(ServiceError.ACCESS_DENIED);
    }
    return succeed(resource);
}

// ❌ Incorrect: Combined check hides existence
async getResource({id, userId}) {
    const resource = await this.repository.getByIdAndUser(id, userId);
    if (!resource) return refuse(ServiceError.NOT_FOUND); // Could be access denied
}
```

#### Repository Design
- **User Repositories**: Include ownership filtering in method parameters
- **Admin Repositories**: No ownership restrictions, full data access
- **Separation**: Maintain separate interfaces and implementations for user vs admin access
- **Unified Interfaces**: Both user and admin repositories may implement similar method signatures for consistency

## Database Design

### Schema Organization
```sql
-- Auth & User Models
users, accounts, sessions, verificationTokens, validDomains

-- Business Domain Models
profiles, companies, projects, projectConfigurations, projectAccesses, secretKeys
```

### Key Relationships
- Users have associated profiles with roles
- Companies can have multiple projects
- Projects are owned by users (profiles)
- Projects have configurations and access controls
- Project accesses define user permissions

## Error Handling Strategy

### Standardized Error Types
- **Service-Level Errors**: Domain-specific enums (e.g., `ProjectServiceError`)
- **Operation Results**: Type-safe success/failure pattern
- **Server Action Errors**: ServerActionError class for client-friendly error messages
- **Logging**: Structured error logging with context

### Error Flow
```
Service Error → OperationResult → Server Action Error Handling → Client
```

## Logging Strategy

### Architecture Overview
The backend implements a comprehensive logging strategy using **Pino** for structured, high-performance logging across all layers of the application.

#### Logger Configuration
```typescript
// src/utils/logger.ts
import pino from 'pino';

const config: LoggerOptions = {
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: { colorize: true }
  } : undefined,
  browser: { asObject: true }
};

export const logger: Logger = pino(config);
```

#### Environment-Specific Behavior
- **Development**: Human-readable colored output via `pino-pretty`
- **Production**: Structured JSON output to stdout for log aggregation
- **Browser**: Object-based logging for client-side debugging

### Logging Across Architecture Layers

#### 1. Server Actions Layer Logging
```typescript
// Server Action with logging
// src/app/_actions/project/queries.ts
'use server';

import { requireAuth } from '../shared/auth';
import { unwrapResult } from '../shared/response';
import { projectContainer } from '~/server/di';
import { logger } from '~/utils';

export async function getProjectById(id: string) {
  const session = await requireAuth();
  const start = Date.now();

  logger.debug({ projectId: id, userId: session.user.id }, 'Server Action: Fetching project');

  try {
    const service = projectContainer.resolve('projectService');
    const result = await service.getProjectById({
      id,
      userId: session.user.id,
      userRole: session.user.role,
    });

    const project = await unwrapResult(result);
    const duration = Date.now() - start;

    logger.info({
      projectId: id,
      userId: session.user.id,
      duration
    }, 'Server Action: Project retrieved successfully');

    return project;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error({
      error,
      projectId: id,
      userId: session.user.id,
      duration
    }, 'Server Action: Project retrieval failed');
    throw error;
  }
}
```

#### 2. Service Layer Logging
```typescript
export class AgentManagementService {
  async getAgentById({id, userId}: {id: string, userId: string}): Promise<OperationResult<AIAgent, AgentManagementServiceError>> {
    logger.debug({ agentId: id, userId }, 'Service: Fetching agent by ID');
    
    try {
      const result = await this.agentRepository.getAgentById({id, userId});
      
      if (!result) {
        logger.warn({ agentId: id, userId }, 'Service: Agent not found');
        return refuse(AgentManagementServiceError.AGENT_NOT_FOUND);
      }
      
      logger.info({ agentId: id, userId }, 'Service: Agent retrieved successfully');
      return succeed(result);
    } catch (error: unknown) {
      logger.error({ error, agentId: id, userId }, 'Service: Error fetching agent by ID');
      return refuse(AgentManagementServiceError.UNKNOWN_ERROR);
    }
  }
}
```

#### 3. Repository Layer Logging
```typescript
export class DrizzleAgentRepository implements AgentRepository {
  async getAgentById({id, userId}: {id: string, userId: string}): Promise<AIAgent | null> {
    logger.debug({ agentId: id, userId }, 'Repository: Executing agent query');
    
    try {
      const rows = await this.db.select()
        .from(aiAgents)
        .leftJoin(agentAssignments, eq(aiAgents.id, agentAssignments.agentId))
        .where(and(
          eq(aiAgents.id, id),
          eq(agentAssignments.profileId, userId),
          isNull(agentAssignments.revokedAt)
        ));
      
      const agent = rows[0]?.aiAgent || null;
      
      if (agent) {
        logger.debug({ agentId: id, userId }, 'Repository: Agent query successful');
      } else {
        logger.debug({ agentId: id, userId }, 'Repository: No agent found for user');
      }
      
      return agent;
    } catch (error: unknown) {
      logger.error({ error, agentId: id, userId }, 'Repository: Database query failed');
      throw error;
    }
  }
}
```

#### 4. Authentication Layer Logging
```typescript
// NextAuth configuration with logging
export const authOptions: NextAuthOptions = {
  callbacks: {
    async signIn({ user, account, profile }) {
      logger.info({ 
        userId: user.id, 
        provider: account?.provider,
        email: user.email 
      }, 'User sign-in attempt');
      
      return true;
    },
    
    async conversation({ conversation, user }) {
      logger.debug({ userId: user.id }, 'Conversation created/updated');
      return conversation;
    }
  },
  
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      logger.info({ 
        userId: user.id, 
        isNewUser,
        provider: account?.provider 
      }, 'User successfully signed in');
    },
    
    async signOut({ conversation, token }) {
      logger.info({ userId: conversation?.user?.id }, 'User signed out');
    }
  }
};
```

### Logging Patterns and Best Practices

#### Structured Context Logging
```typescript
// ✅ Good - Rich context for debugging
logger.info({ 
  userId, 
  agentId, 
  conversationId, 
  action: 'create_conversation',
  timestamp: new Date().toISOString()
}, 'User created new agent conversation');

// ✅ Good - Error context for troubleshooting
logger.error({ 
  error: error.message,
  stack: error.stack,
  userId, 
  agentId,
  operation: 'update_agent',
  requestId: generateRequestId()
}, 'Failed to update agent');
```

#### Performance Monitoring
```typescript
// Database query performance logging
const startTime = Date.now();
const result = await this.db.select().from(aiAgents).where(eq(aiAgents.id, id));
const queryTime = Date.now() - startTime;

logger.info({ 
  queryTime, 
  table: 'aiAgents',
  operation: 'select_by_id',
  agentId: id 
}, 'Database query completed');
```

#### Security Event Logging
```typescript
// Authentication events
logger.warn({ 
  userId, 
  ipAddress: request.ip,
  userAgent: request.headers['user-agent'],
  attemptCount: failedAttempts,
  action: 'failed_login'
}, 'Multiple failed login attempts detected');

// Authorization events
logger.info({ 
  userId, 
  resourceId: agentId,
  action: 'access_denied',
  reason: 'insufficient_permissions'
}, 'User access denied to agent');
```

### Log Aggregation and Monitoring

#### Production Log Structure
```json
{
  "level": 30,
  "time": 1640995200000,
  "msg": "Agent retrieved successfully",
  "agentId": "uuid-123",
  "userId": "user-456",
  "duration": 45,
  "operation": "get_agent_by_id",
  "service": "AgentManagementService"
}
```

#### Development Log Structure
```
[2024-01-01 10:30:45.123] INFO: Agent retrieved successfully
    agentId: "uuid-123"
    userId: "user-456"
    duration: 45
    operation: "get_agent_by_id"
    service: "AgentManagementService"
```

### Error Correlation and Tracing

#### Request Tracing
```typescript
// Generate unique request ID for correlation
const requestId = crypto.randomUUID();

// Pass request ID through all layers
logger.info({ requestId, userId, action: 'start_request' }, 'Request initiated');

// In service layer
logger.debug({ requestId, agentId, operation: 'fetch_agent' }, 'Fetching agent data');

// In repository layer  
logger.debug({ requestId, query: 'SELECT * FROM agents', duration: 25 }, 'Database query executed');
```

#### Error Chain Logging
```typescript
// Service layer error
logger.error({ 
  requestId, 
  error: error.message,
  stack: error.stack,
  context: { agentId, userId },
  layer: 'service'
}, 'Service layer error');

// Repository layer error
logger.error({ 
  requestId,
  error: dbError.message,
  query: 'SELECT * FROM agents WHERE id = ?',
  context: { agentId },
  layer: 'repository'
}, 'Database error');
```

## Performance Considerations

### Development Optimizations
- **Connection Caching**: Database connections cached in development
- **Timing Middleware**: Performance monitoring with artificial delays
- **HMR Support**: Hot module replacement without connection leaks

### Production Optimizations
- **Connection Pooling**: Postgres connection pooling
- **Query Optimization**: Drizzle ORM with proper indexes
- **Type-Only Imports**: Reduced bundle size with type imports

## Testing Strategy

### Unit Testing
- **Service Layer**: Business logic testing with mocked repositories
- **Repository Layer**: Data access testing with test database
- **Integration Testing**: Full stack testing with test client

### Test Organization
```
src/server/domains/agents/
├── agent.service.spec.ts
├── admin-agent.service.spec.ts
└── ...
```

## Scalability Considerations

### Horizontal Scaling
- **Stateless Design**: No server-side state beyond database
- **Database Connection Pooling**: Supports multiple server instances
- **Conversation Storage**: Database-backed conversations for multi-instance deployments

### Vertical Scaling
- **Lazy Loading**: Services instantiated per request
- **Connection Reuse**: Singleton database connections
- **Memory Management**: Proper cleanup and garbage collection

## Migration and Evolution

### Adding New Domains
1. Create domain folder under `/src/server/domains/`
2. Define repository interfaces (`lib.types.ts`)
   - Separate user and admin repository interfaces if needed
3. Implement repository classes
   - `DrizzleXRepository` for user operations
   - `DrizzleAdminXRepository` for admin operations (if needed)
4. Create service classes with business logic
   - `XService` for user-facing operations with access control
   - `AdminXService` for admin operations (if needed)
5. Create domain container in `/src/server/di/{domain}.container.ts`
   - Register repositories with scoped lifetime
   - Register services with scoped lifetime
   - Follow naming convention: `{domain}Container`
6. Update DI index (`/src/server/di/index.ts`)
   - Export new container
7. Add Server Actions in `/src/app/_actions/{domain}/`
   - `queries.ts` for data fetching operations
   - `mutations.ts` for data modification operations
   - Import container from `~/server/di`
   - Use `requireAuth()` or `requireAdmin()` for authentication
   - Call `revalidate*()` functions after mutations
8. Write comprehensive tests
   - Unit tests for services with mocked repositories
   - Integration tests for repositories with test database
   - Container tests in `/src/server/di/{domain}.container.spec.ts`

### Schema Evolution
1. Create Drizzle migration files
2. Update schema definitions
3. Update TypeScript types
4. Update repository implementations
5. Run database migrations

## Development Workflow

### Adding New Features
1. **Define Types**: Add to `/src/shared/types/` and `/src/shared/validation/`
2. **Update Schema**: Modify database schema if needed
3. **Create Repository**: Define interface and implementation
4. **Implement Service**: Add business logic with error handling
5. **Create Domain Container**: Add container file in `/src/server/di/{domain}.container.ts`
6. **Register Dependencies**: Add repositories and services to domain container
7. **Update DI Index**: Export new container from `/src/server/di/index.ts`
8. **Create Server Actions**: Add queries and mutations in `/src/app/_actions/{domain}/`
9. **Write Tests**: Unit and integration tests
10. **Update Documentation**: API and architecture docs

### Best Practices

#### Core Patterns
- Always use the `OperationResult` pattern for error handling
- Implement repository interfaces before concrete implementations
- Use dependency injection for testability
- Follow the existing naming conventions
- Add proper TypeScript types for all new entities
- Include comprehensive error handling and logging

#### Business Logic Rules
- **Business Logic in Services**: Keep access control and validation logic in service layer
- **Existence Before Access**: Always check resource existence before access permissions
- **Separate Admin/User Paths**: Use distinct services and repositories for admin vs user operations
- **Transparent Errors**: Provide clear distinction between "not found" and "access denied" errors
- **Single Domain Focus**: Services should only handle their domain's core responsibilities

#### Import and Dependency Rules
- **Domain Isolation**: Domains MUST NOT import from each other
- **Repository Boundaries**: Repository implementations may only import from `~/server/db`
- **Cross-Domain Data**: Create domain-specific repositories instead of sharing implementations
- **Type Sharing**: Use `~/shared/types/other-domain` for cross-domain type imports
- **Service Simplification**: Remove cross-domain dependencies to focus on core domain logic
- **Server Actions Delegation**: Server Actions should delegate all validation to their respective services

#### Repository Design Rules
- **Unified Interfaces**: Use consistent method signatures across user and admin repositories
- **Access Control in Implementation**: Handle ownership filtering in repository implementation, not interface
- **Single Responsibility**: Each repository should focus on data access for its specific domain
- **No Cross-Domain Queries**: Repositories should only query their domain's tables

#### Testing Rules
- **Mock Domain Boundaries**: Mock repositories instead of importing cross-domain services
- **Test Domain Logic**: Focus tests on the domain's specific business rules
- **Isolated Unit Tests**: Services should be testable without cross-domain dependencies

#### Dependency Injection Rules
- **Container-based DI**: Use Awilix container for all service and repository management
- **Lifetime Management**: Singleton for expensive resources, Scoped for request-specific instances
- **Service Composition**: Services can depend on repositories, not other services
- **Container Registration**: Register dependencies before dependents, use factory functions
- **Server Actions Integration**: Resolve services directly from containers in Server Actions
- **Testing Support**: Container enables easy mocking and dependency substitution

### Architectural Evolution Patterns

Based on the conversations domain refactoring, these patterns emerged for maintaining clean architecture:

#### Service Simplification Pattern
When services become too complex with cross-domain dependencies:

```typescript
// Before: Complex service with multiple domain dependencies
export class AdminConversationService {
  constructor(
    private readonly conversationRepository: AdminConversationRepository,
    private readonly agentRepository: AdminAgentRepository // Cross-domain
  ) {}
  
  async createConversation({conversationData, userId}) {
    const agent = await this.agentRepository.getAgentById(conversationData.agentId);
    if (!agent) return refuse(AdminConversationServiceError.AGENT_NOT_FOUND);
    // ... complex validation logic
  }
}

// After: Simplified service focused on core domain
export class AdminConversationService {
  constructor(private readonly conversationRepository: AdminConversationRepository) {}
  
  async getConversationById(id: string) {
    const conversation = await this.conversationRepository.getConversationById(id);
    if (!conversation) return refuse(AdminConversationServiceError.SESSION_NOT_FOUND);
    return succeed(conversation);
  }
}
```

#### Repository Interface Convergence Pattern
User and admin repositories evolve toward similar interfaces:

```typescript
// Pattern: Similar method signatures with different access control
export interface ConversationRepository {
  getConversationById(id: string): Promise<AgentConversation | null>;
  // Implementation filters by userId in WHERE clause
}

export interface AdminConversationRepository {
  getConversationById(id: string): Promise<AgentConversation | null>; 
  // Implementation has no user filtering
}
```

#### Server Actions Responsibility Reduction Pattern
Server Actions delegate complex operations to services:

```typescript
// Before: Server Action handling validation and business logic
'use server';

export async function createProject(data: ProjectCreateInput) {
  const session = await requireAuth();
  const { userId, ...projectData } = data;

  // Server Action doing complex validation...
  const companyService = companyContainer.resolve('companyService');
  const company = await companyService.getById(projectData.companyId);
  if (!company) throw new Error('Company not found');

  const projectService = projectContainer.resolve('projectService');
  const result = await projectService.createProject({projectData, userId});
  return unwrapResult(result);
}

// After: Server Action focused on auth and service resolution only
'use server';

export async function createProject(data: CreateProjectFormInput) {
  const session = await requireAuth();
  const service = projectContainer.resolve('projectService');
  const result = await service.createProject({
    ...data,
    userId: session.user.id,
  });
  const project = await unwrapResult(result);
  revalidateProjects();
  return project;
}
```

## Tools and Import Enforcement

### Development Tools
- **TypeScript**: Strict mode enabled with comprehensive type checking
- **ESLint**: Comprehensive linting rules with domain boundary enforcement
- **Prettier**: Consistent code formatting
- **Jest**: Unit and integration testing with domain isolation
- **Drizzle Studio**: Database inspection and management

### Import Rule Enforcement
The architecture relies on strict domain boundaries. Consider implementing these ESLint rules:

```json
// .eslintrc.json - Example import restriction rules
{
  "rules": {
    "no-restricted-imports": ["error", {
      "patterns": [
        {
          "group": ["~/server/domains/*/repositories/*", "~/server/domains/*/services/*"],
          "message": "Cross-domain imports are not allowed. Create domain-specific repositories instead."
        },
        {
          "group": ["~/server/domains/agents/*"],
          "importNames": ["*"],
          "message": "Direct cross-domain imports forbidden. Use ~/types/other-domain for shared types."
        }
      ]
    }]
  }
}
```

## External Libraries and Dependencies

### Standardized Library Usage

The backend architecture follows a consistent approach to external library selection and usage to maintain code consistency, reduce bundle size, and ensure predictable behavior across the application.

#### Date Manipulation: date-fns

**Library**: `date-fns`  
**Purpose**: All date and time operations, formatting, and calculations

**Usage Guidelines**:
- **Import Strategy**: Use named imports for tree-shaking optimization
- **Consistency**: Always use date-fns instead of native Date methods for complex operations
- **Timezone Handling**: Use date-fns timezone utilities for consistent timezone management

```typescript
// ✅ Correct: Using date-fns for date operations
import { format, addDays, isAfter, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

export class ConversationService {
  async getConversationsInDateRange(startDate: string, endDate: string) {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    if (isAfter(start, end)) {
      return refuse(ConversationServiceError.INVALID_DATE_RANGE);
    }
    
    // Use date-fns for all date calculations
    const conversations = await this.conversationRepository.getConversationsBetween(start, end);
    return succeed(conversations);
  }
}

// ❌ Incorrect: Using native Date methods
const today = new Date();
const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
```

**Common date-fns Patterns**:
```typescript
// Date formatting
import { format } from 'date-fns';
const formattedDate = format(new Date(), 'yyyy-MM-dd');

// Date calculations
import { addDays, subDays, differenceInDays } from 'date-fns';
const nextWeek = addDays(new Date(), 7);
const daysDiff = differenceInDays(endDate, startDate);

// Date validation
import { isValid, isAfter, isBefore } from 'date-fns';
if (!isValid(date) || isAfter(date, new Date())) {
  return refuse(ValidationError.INVALID_DATE);
}

// Timezone handling
import { formatInTimeZone } from 'date-fns-tz';
const utcTime = formatInTimeZone(new Date(), 'UTC', 'yyyy-MM-dd HH:mm:ss');
```

#### Utility Functions: lodash

**Library**: `lodash`  
**Purpose**: Data manipulation, object/array operations, and functional programming utilities

**Usage Guidelines**:
- **Import Strategy**: Use specific function imports to minimize bundle size
- **Consistency**: Use lodash for complex data transformations instead of custom implementations
- **Performance**: Leverage lodash's optimized implementations for large datasets

```typescript
// ✅ Correct: Using lodash for data manipulation
import { groupBy, uniqBy, pick, omit, isEmpty } from 'lodash';

export class AgentManagementService {
  async getAgentsByCategory(agents: AIAgent[]) {
    // Use lodash for complex grouping operations
    const grouped = groupBy(agents, 'category');
    return succeed(grouped);
  }
  
  async sanitizeAgentData(agentData: any) {
    // Use lodash for object manipulation
    const sanitized = pick(agentData, ['name', 'description', 'category']);
    return succeed(sanitized);
  }
  
  async validateAgentList(agents: AIAgent[]) {
    // Use lodash for validation
    if (isEmpty(agents)) {
      return refuse(AgentManagementServiceError.NO_AGENTS_FOUND);
    }
    
    const uniqueAgents = uniqBy(agents, 'id');
    return succeed(uniqueAgents);
  }
}

// ❌ Incorrect: Custom implementations instead of lodash
const grouped = agents.reduce((acc, agent) => {
  if (!acc[agent.category]) acc[agent.category] = [];
  acc[agent.category].push(agent);
  return acc;
}, {});
```

**Common lodash Patterns**:
```typescript
// Object manipulation
import { pick, omit, merge, cloneDeep } from 'lodash';
const publicData = pick(user, ['id', 'name', 'email']);
const privateData = omit(user, ['password', 'secretKey']);

// Array operations
import { groupBy, uniqBy, sortBy, filter } from 'lodash';
const conversationsByUser = groupBy(conversations, 'userId');
const uniqueConversations = uniqBy(conversations, 'id');

// Data validation
import { isEmpty, isNil, isArray, isObject } from 'lodash';
if (isEmpty(data) || !isArray(data)) {
  return refuse(ValidationError.INVALID_DATA);
}

// Functional programming
import { map, filter, reduce, find } from 'lodash';
const activeConversations = filter(conversations, conversation => conversation.isActive);
const conversationIds = map(activeConversations, 'id');
```

#### Library Selection Criteria

**Date Manipulation**:
- **Why date-fns**: Lightweight, modular, immutable, TypeScript-friendly
- **Alternatives Avoided**: moment.js (heavy), dayjs (less features), native Date (inconsistent)

**Utility Functions**:
- **Why lodash**: Battle-tested, comprehensive, optimized, well-documented
- **Alternatives Avoided**: ramda (functional focus), native methods (inconsistent), custom utilities (maintenance burden)

#### Import Patterns

**Tree-shaking Optimization**:
```typescript
// ✅ Correct: Named imports for tree-shaking
import { format, addDays } from 'date-fns';
import { groupBy, pick } from 'lodash';

// ❌ Incorrect: Default imports (prevents tree-shaking)
import dateFns from 'date-fns';
import _ from 'lodash';
```

**Type-only Imports**:
```typescript
// ✅ Correct: Type-only imports when only types are needed
import type { Locale } from 'date-fns';
import type { Dictionary } from 'lodash';
```

#### Bundle Size Considerations

**Optimization Strategies**:
1. **Specific Imports**: Always import specific functions to enable tree-shaking
2. **Avoid Default Imports**: Prefer named imports for better optimization
3. **Type-only Imports**: Use `import type` for type-only dependencies
4. **Lazy Loading**: Consider dynamic imports for large utility functions

**Bundle Analysis**:
```typescript
// ✅ Optimized: Only imports what's needed
import { format, addDays } from 'date-fns'; // ~2KB
import { groupBy, pick } from 'lodash'; // ~3KB

// ❌ Unoptimized: Imports entire libraries
import * as dateFns from 'date-fns'; // ~50KB
import _ from 'lodash'; // ~70KB
```

#### Testing Considerations

**Mocking External Libraries**:
```typescript
// Mock date-fns for consistent testing
jest.mock('date-fns', () => ({
  format: jest.fn(() => '2024-01-01'),
  addDays: jest.fn((date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000)),
}));

// Mock lodash for predictable test data
jest.mock('lodash', () => ({
  groupBy: jest.fn((array, key) => {
    return array.reduce((groups, item) => {
      const group = item[key];
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  }),
}));
```

### Validation Checklist
When adding new domains or modifying existing ones:

1. **Import Validation**: Ensure no cross-domain imports exist (except via `~/types/`)
2. **Type Sharing**: Verify shared types are in `~/types/` directory, not in domain folders
3. **Service Focus**: Verify services only handle their domain's core logic
4. **Repository Boundaries**: Confirm repositories only access their domain's tables
5. **Interface Consistency**: Check that similar operations have consistent signatures
6. **Business Logic Placement**: Validate that access control is in services, not repositories
7. **Error Transparency**: Ensure clear distinction between "not found" and "access denied"
8. **Library Usage**: Verify consistent use of date-fns for date operations and lodash for utilities
9. **Container Location**: Verify containers are in `/src/server/di/` not in domain folders
10. **Container Naming**: Ensure containers follow `{domain}.container.ts` naming convention
11. **Container Registration**: Verify proper dependency order and lifetime management
12. **Server Actions Integration**: Resolve services directly from containers in Server Actions
13. **Service Resolution**: Ensure all services are resolved through container, not direct instantiation
14. **Import Patterns**: Verify Server Actions import containers from `~/server/di`, not domain folders
15. **Domain Boundaries**: Ensure domain folders don't import database code directly

### Pre-commit Checks
- **Type Checking**: `tsc --noEmit`
- **Linting**: `eslint --fix` (includes import rule enforcement)
- **Testing**: `jest --passWithNoTests`
- **Formatting**: `prettier --write`
- **Domain Boundary Validation**: Manual review of import statements
- **Library Usage Validation**: Ensure consistent external library usage patterns
