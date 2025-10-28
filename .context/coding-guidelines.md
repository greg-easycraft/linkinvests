# Coding Guidelines

## Overview

This document outlines the coding standards and best practices for the entire codebase (both frontend and backend). These guidelines ensure consistency, maintainability, and type safety across the entire application.

## General Principles

### 1. Type Safety First
- **Always use TypeScript**: The `any` type is **FORBIDDEN** throughout the entire repository and should **NEVER** be used under any circumstances
- **Explicit Return Types**: Always specify return types for public methods
- **Strict Configuration**: Maintain strict TypeScript configuration
- **Type-Only Imports**: Use `type` imports when importing only types

```typescript
// ✅ Good
import type { AIAgent } from "~/types/agent";
import { db } from "~/server/db";

// ❌ Avoid
import { AIAgent } from "~/types/agent"; // when only using as type
```

#### The `any` Type is Absolutely Forbidden

The `any` type completely defeats the purpose of TypeScript and is **STRICTLY PROHIBITED** in this codebase. There are no exceptions to this rule.

**Why `any` is forbidden:**
- Eliminates all type safety benefits
- Prevents IDE autocompletion and refactoring
- Hides runtime errors during development
- Makes code unmaintainable and unpredictable
- Breaks the entire type system chain

**Proper alternatives to `any`:**

```typescript
// ❌ FORBIDDEN - Never use any
function processData(data: any): any {
    return data.someProperty;
}

// ✅ CORRECT - Use proper typing
interface ProcessableData {
    someProperty: string;
    otherProperty?: number;
}

function processData(data: ProcessableData): string {
    return data.someProperty;
}

// ✅ CORRECT - Use generics for flexible typing
function processGenericData<T extends { someProperty: string }>(data: T): string {
    return data.someProperty;
}

// ✅ CORRECT - Use unknown for truly unknown data, then narrow
function processUnknownData(data: unknown): string {
    if (typeof data === 'object' && data !== null && 'someProperty' in data) {
        const typedData = data as { someProperty: string };
        return typedData.someProperty;
    }
    throw new Error('Invalid data structure');
}

// ✅ CORRECT - Use union types for multiple possibilities
type ApiResponse = 
    | { success: true; data: AIAgent }
    | { success: false; error: string };

function handleApiResponse(response: ApiResponse): AIAgent | null {
    if (response.success) {
        return response.data;
    }
    logger.error({ error: response.error }, 'API call failed');
    return null;
}

// ✅ CORRECT - Use Record for dynamic object keys
function processUserData(userData: Record<string, string | number>): void {
    Object.entries(userData).forEach(([key, value]) => {
        logger.info({ key, value, type: typeof value }, 'Processing user data');
    });
}
```

**Common scenarios and their proper solutions:**

```typescript
// Scenario 1: External API responses
// ❌ FORBIDDEN
const apiData: any = await fetch('/api/data').then(r => r.json());

// ✅ CORRECT - Define expected structure
interface ApiData {
    id: string;
    name: string;
    status: 'active' | 'inactive';
}
const apiData: ApiData = await fetch('/api/data').then(r => r.json());

// Scenario 2: Dynamic object properties
// ❌ FORBIDDEN
const config: any = {};
config.someProperty = 'value';

// ✅ CORRECT - Use Record or index signature
const config: Record<string, string> = {};
config.someProperty = 'value';

// Or with interface
interface Config {
    [key: string]: string;
}

// Scenario 3: Third-party library without types
// ❌ FORBIDDEN
const libraryResult: any = someLibraryFunction();

// ✅ CORRECT - Create type definitions
interface LibraryResult {
    success: boolean;
    data?: unknown;
    error?: string;
}
const libraryResult: LibraryResult = someLibraryFunction();

// Scenario 4: Error handling
// ❌ FORBIDDEN
catch (error: any) {
    console.log(error.message);
}

// ✅ CORRECT - Use unknown and type narrowing
catch (error: unknown) {
    if (error instanceof Error) {
        logger.error({ error: error.message }, 'Operation failed');
    } else {
        logger.error({ error: String(error) }, 'Unknown error occurred');
    }
}
```

**ESLint enforcement:**
The `@typescript-eslint/no-explicit-any` rule is enabled in our ESLint configuration to automatically catch and prevent any usage of the `any` type. This rule will cause the build to fail if `any` is used anywhere in the codebase.

### 2. Error Handling
- **Use OperationResult Pattern**: Always return `OperationResult<T, E>` for operations that can fail
- **Structured Error Types**: Define specific error enums for each service
- **Comprehensive Logging**: Log errors with context for debugging

```typescript
// ✅ Good
export enum AgentManagementServiceError {
    AGENT_NOT_FOUND = "Agent not found",
    UNKNOWN_ERROR = "Unknown error",
}

async getAgentById({id, userId}: {id: string, userId: string}): Promise<OperationResult<AIAgent, AgentManagementServiceError>> {
    try {
        const result = await this.agentRepository.getAgentById({id, userId});
        if (!result) return refuse(AgentManagementServiceError.AGENT_NOT_FOUND);
        return succeed(result);
    } catch (error: unknown) {
        logger.error("Error fetching agent by ID", {id, userId, error});
        return refuse(AgentManagementServiceError.UNKNOWN_ERROR);
    }
}

// ❌ Avoid
async getAgentById(id: string): Promise<AIAgent> {
    return await this.agentRepository.getAgentById(id); // Can throw uncaught errors
}
```

### 3. Logging Guidelines

The application uses **Pino** as the structured logging library, providing consistent logging across both client and server environments.

#### Logger Configuration
```typescript
// Import the logger from utils
import { logger } from '~/utils';

// Logger automatically adapts to environment:
// - Development: Human-readable colored output via pino-pretty
// - Production: Structured JSON output to stdout
// - Browser: Object-based logging for client-side debugging
```

#### Logging Levels and Usage
- **`logger.debug()`**: Detailed information for debugging (development only)
- **`logger.info()`**: General information about application flow
- **`logger.warn()`**: Warning conditions that don't stop execution
- **`logger.error()`**: Error conditions that require attention

#### Structured Logging Best Practices
```typescript
// ✅ Good - Structured logging with context
logger.info({ userId, agentId, action: 'create_conversation' }, 'User created new agent conversation');
logger.error({ error, userId, conversationId }, 'Failed to save conversation data');
logger.warn({ userId, attemptCount }, 'Multiple failed login attempts detected');

// ✅ Good - Client-side logging
logger.info({ formType: 'login', email }, 'User submitted login form');
logger.error({ error, formType: 'signup' }, 'Form submission failed');

// ❌ Avoid - Unstructured logging
logger.info('User created conversation'); // Missing context
logger.error('Something went wrong'); // No error details or context
```

#### Context and Metadata Guidelines
- **Always include relevant context**: userId, conversationId, agentId, etc.
- **Use consistent field names**: `userId`, `agentId`, `conversationId` (camelCase)
- **Include operation context**: `action`, `formType`, `operation`
- **Log errors with full context**: Include the error object and relevant identifiers

#### Service Layer Logging Patterns
```typescript
export class AgentManagementService {
    async getAgentById({id, userId}: {id: string, userId: string}): Promise<OperationResult<AIAgent, AgentManagementServiceError>> {
        logger.debug({ agentId: id, userId }, 'Fetching agent by ID');
        
        try {
            const result = await this.agentRepository.getAgentById({id, userId});
            if (!result) {
                logger.warn({ agentId: id, userId }, 'Agent not found');
                return refuse(AgentManagementServiceError.AGENT_NOT_FOUND);
            }
            
            logger.info({ agentId: id, userId }, 'Successfully retrieved agent');
            return succeed(result);
        } catch (error: unknown) {
            logger.error({ error, agentId: id, userId }, 'Error fetching agent by ID');
            return refuse(AgentManagementServiceError.UNKNOWN_ERROR);
        }
    }
}
```

#### Client-Side Logging Patterns
```typescript
// Form submission logging
const handleSubmit = async (formData: FormData) => {
    logger.info({ formType: 'login', email: formData.email }, 'User submitted login form');
    
    try {
        await submitForm(formData);
        logger.info({ formType: 'login' }, 'Login form submitted successfully');
    } catch (error) {
        logger.error({ error, formType: 'login' }, 'Login form submission failed');
    }
};

// API interaction logging
const fetchAgentData = async (agentId: string) => {
    logger.debug({ agentId }, 'Fetching agent data from API');
    
    try {
        const agent = await api.agent.getById({ id: agentId });
        logger.info({ agentId }, 'Successfully fetched agent data');
        return agent;
    } catch (error) {
        logger.error({ error, agentId }, 'Failed to fetch agent data');
        throw error;
    }
};
```

#### Client vs Server Logging Context

##### Client-Side Logging (Browser Environment)
```typescript
// React component logging
const AgentChat = ({ agentId }: { agentId: string }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  
  useEffect(() => {
    logger.info({ agentId, component: 'AgentChat' }, 'Component mounted');
    
    return () => {
      logger.debug({ agentId, component: 'AgentChat' }, 'Component unmounting');
    };
  }, [agentId]);

  const sendMessage = async (content: string) => {
    logger.info({ 
      agentId, 
      messageLength: content.length,
      action: 'send_message' 
    }, 'User sending message');
    
    try {
      const response = await api.conversation.sendMessage({ agentId, content });
      logger.info({ agentId, messageId: response.id }, 'Message sent successfully');
      return response;
    } catch (error) {
      logger.error({ error, agentId, action: 'send_message' }, 'Failed to send message');
      throw error;
    }
  };

  return (
    // Component JSX
  );
};

// Client-side error boundary logging
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error({ 
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: 'AgentChat'
    }, 'React error boundary caught error');
  }
}

// Client-side performance logging
const trackPageLoad = () => {
  const loadTime = performance.now();
  logger.info({ 
    loadTime, 
    page: 'agent-detail',
    userAgent: navigator.userAgent 
  }, 'Page load completed');
};
```

##### Server-Side Logging (Node.js Environment)
```typescript
// Server Action logging
// src/app/_actions/agent/queries.ts
'use server';

import { requireAuth } from '../shared/auth';
import { unwrapResult } from '../shared/response';
import { agentContainer } from '~/server/di';
import { logger } from '~/utils';

export async function getAgentById(id: string) {
  const session = await requireAuth();

  logger.debug({
    agentId: id,
    userId: session.user.id,
    action: 'getAgentById'
  }, 'Server Action started');

  const service = agentContainer.resolve('agentManagementService');
  const result = await service.getAgentById({
    id,
    userId: session.user.id
  });

  if (isSuccess(result)) {
    logger.info({
      agentId: id,
      userId: session.user.id,
      action: 'getAgentById'
    }, 'Server Action completed successfully');
    return result.data;
  }

  logger.warn({
    agentId: id,
    userId: session.user.id,
    reason: result.reason,
    action: 'getAgentById'
  }, 'Server Action failed');
  throw new Error(result.reason);
}

// Server-side middleware logging
const authMiddleware = async (req: NextRequest) => {
  const startTime = Date.now();
  
  logger.info({ 
    method: req.method,
    url: req.url,
    userAgent: req.headers.get('user-agent'),
    ip: req.ip
  }, 'Incoming request');
  
  try {
    const conversation = await getServerConversation(authOptions);
    
    if (!conversation) {
      logger.warn({ 
        url: req.url,
        reason: 'no_conversation'
      }, 'Unauthenticated request');
      return NextResponse.redirect(new URL('/signin', req.url));
    }
    
    logger.debug({ 
      userId: conversation.user.id,
      url: req.url,
      duration: Date.now() - startTime
    }, 'Request authenticated');
    
    return NextResponse.next();
  } catch (error) {
    logger.error({ 
      error: error.message,
      url: req.url,
      duration: Date.now() - startTime
    }, 'Authentication middleware error');
    throw error;
  }
};

// Server-side database logging
export class DrizzleAgentRepository implements AgentRepository {
  async getAgentById({id, userId}: {id: string, userId: string}): Promise<AIAgent | null> {
    const queryStart = Date.now();
    
    logger.debug({ 
      agentId: id, 
      userId,
      operation: 'select_agent_by_id'
    }, 'Executing database query');
    
    try {
      const rows = await this.db.select()
        .from(aiAgents)
        .leftJoin(agentAssignments, eq(aiAgents.id, agentAssignments.agentId))
        .where(and(
          eq(aiAgents.id, id),
          eq(agentAssignments.profileId, userId),
          isNull(agentAssignments.revokedAt)
        ));
      
      const queryTime = Date.now() - queryStart;
      const agent = rows[0]?.aiAgent || null;
      
      logger.info({ 
        agentId: id, 
        userId,
        queryTime,
        rowCount: rows.length,
        found: !!agent
      }, 'Database query completed');
      
      return agent;
    } catch (error) {
      const queryTime = Date.now() - queryStart;
      
      logger.error({ 
        error: error.message,
        agentId: id, 
        userId,
        queryTime,
        operation: 'select_agent_by_id'
      }, 'Database query failed');
      
      throw error;
    }
  }
}
```

##### Environment-Specific Logging Behavior

**Development Environment (Client & Server)**:
```typescript
// Both client and server use human-readable output
logger.debug({ userId, action: 'debug_info' }, 'Debug information');
// Output: [2024-01-01 10:30:45.123] DEBUG: Debug information
//         userId: "user-123"
//         action: "debug_info"
```

**Production Environment (Server)**:
```typescript
// Server outputs structured JSON for log aggregation
logger.info({ userId, agentId, duration: 45 }, 'Operation completed');
// Output: {"level":30,"time":1640995200000,"msg":"Operation completed","userId":"user-123","agentId":"agent-456","duration":45}
```

**Production Environment (Client)**:
```typescript
// Client outputs objects for browser dev tools
logger.info({ userId, action: 'user_action' }, 'User performed action');
// Output: { level: 30, time: 1640995200000, msg: "User performed action", userId: "user-123", action: "user_action" }
```

#### Performance and Timing Logging
```typescript
// Server Action timing example
export async function getAgentById(id: string) {
    const session = await requireAuth();
    const start = Date.now();

    const service = agentContainer.resolve('agentManagementService');
    const result = await service.getAgentById({ id, userId: session.user.id });

    const duration = Date.now() - start;
    logger.info({ agentId: id, userId: session.user.id, duration }, 'Server Action completed');

    return unwrapResult(result);
}
```

#### Security Considerations
- **Never log sensitive data**: passwords, tokens, personal information
- **Log security events**: failed logins, access attempts, permission changes
- **Include user context**: userId for audit trails
- **Sanitize error messages**: Don't expose internal system details

```typescript
// ✅ Good - Security-aware logging
logger.warn({ userId, ipAddress, attemptCount }, 'Multiple failed login attempts');
logger.info({ userId, action: 'password_reset' }, 'User initiated password reset');

// ❌ Avoid - Sensitive data exposure
logger.info({ password, token }, 'User login data'); // Never log passwords or tokens
```

#### Advanced Logging Patterns

##### Request Correlation and Tracing
```typescript
// Generate unique request ID for end-to-end tracing
const requestId = crypto.randomUUID();

// Pass request ID through all layers
logger.info({ requestId, userId, action: 'start_request' }, 'Request initiated');

// In service layer
logger.debug({ requestId, agentId, operation: 'fetch_agent' }, 'Fetching agent data');

// In repository layer
logger.debug({ requestId, query: 'SELECT * FROM agents', duration: 25 }, 'Database query executed');
```

##### Performance Monitoring
```typescript
// Database query performance
const startTime = Date.now();
const result = await this.db.select().from(aiAgents).where(eq(aiAgents.id, id));
const queryTime = Date.now() - startTime;

logger.info({ 
  queryTime, 
  table: 'aiAgents',
  operation: 'select_by_id',
  agentId: id 
}, 'Database query completed');

// API response timing
const apiStart = Date.now();
const response = await fetch('/api/agents');
const apiDuration = Date.now() - apiStart;

logger.info({ 
  apiDuration, 
  endpoint: '/api/agents',
  status: response.status 
}, 'API call completed');
```

##### Business Event Logging
```typescript
// User actions
logger.info({ 
  userId, 
  agentId, 
  action: 'create_conversation',
  conversationType: 'chat'
}, 'User created new agent conversation');

// System events
logger.info({ 
  agentId, 
  status: 'activated',
  activatedBy: userId,
  reason: 'admin_approval'
}, 'Agent status changed to active');

// Data changes
logger.info({ 
  userId, 
  agentId,
  changes: { name: 'Old Name → New Name', description: 'Updated' },
  action: 'update_agent'
}, 'Agent updated by user');
```

##### Error Context Enrichment
```typescript
// Rich error context for debugging
try {
  await processAgentData(agentData);
} catch (error) {
  logger.error({ 
    error: error.message,
    stack: error.stack,
    userId, 
    agentId,
    operation: 'process_agent_data',
    inputData: {
      name: agentData.name,
      hasDescription: !!agentData.description,
      contextLength: agentData.systemContext?.length
    },
    requestId: generateRequestId()
  }, 'Failed to process agent data');
  
  throw error;
}
```

##### Conditional Logging
```typescript
// Log only in development for debugging
if (process.env.NODE_ENV === 'development') {
  logger.debug({ 
    queryParams, 
    requestBody: sanitizeRequestBody(body),
    userId 
  }, 'Request details for debugging');
}

// Log based on feature flags
if (featureFlags.enableDetailedLogging) {
  logger.info({ 
    userId, 
    conversationId,
    interactionCount: conversation.interactions.length,
    averageResponseTime: calculateAverageResponseTime(conversation)
  }, 'Detailed conversation metrics');
}
```

##### Batch Operations Logging
```typescript
// Log batch operation progress
const batchSize = agents.length;
logger.info({ 
  batchSize, 
  operation: 'bulk_agent_update',
  userId 
}, 'Starting bulk agent update');

for (let i = 0; i < agents.length; i += 10) {
  const batch = agents.slice(i, i + 10);
  
  try {
    await updateAgentBatch(batch);
    logger.info({ 
      processed: i + batch.length, 
      total: batchSize,
      batchIndex: Math.floor(i / 10) + 1
    }, 'Batch update progress');
  } catch (error) {
    logger.error({ 
      error, 
      batchStart: i, 
      batchEnd: i + batch.length,
      batchSize: batch.length
    }, 'Batch update failed');
  }
}
```

##### Logging in Async Operations
```typescript
// Promise-based operations
const processAgentAsync = async (agentId: string) => {
  logger.debug({ agentId }, 'Starting async agent processing');
  
  try {
    const result = await Promise.all([
      fetchAgentData(agentId),
      validateAgentPermissions(agentId),
      checkAgentStatus(agentId)
    ]);
    
    logger.info({ agentId, resultCount: result.length }, 'Async processing completed');
    return result;
  } catch (error) {
    logger.error({ error, agentId }, 'Async processing failed');
    throw error;
  }
};

// Stream processing
const processAgentStream = (agentStream: ReadableStream) => {
  logger.info({ streamType: 'agent_data' }, 'Starting stream processing');
  
  return agentStream.pipeThrough(new TransformStream({
    transform(chunk, controller) {
      logger.debug({ chunkSize: chunk.length }, 'Processing stream chunk');
      controller.enqueue(processChunk(chunk));
    },
    flush(controller) {
      logger.info({ streamType: 'agent_data' }, 'Stream processing completed');
      controller.terminate();
    }
  }));
};
```

### 4. Return Early Principle
- **Avoid Nested Conditions**: Use early returns to reduce nesting and improve readability
- **Guard Clauses**: Check for error conditions first and return early
- **Minimize Else Statements**: Structure code to avoid else clauses when possible
- **Single Level of Indentation**: Keep the main logic at the top level

```typescript
// ✅ Good - Return early pattern
function validateUser(user: User | null): ValidationResult {
    if (!user) return { isValid: false, error: 'User is required' };
    if (!user.email) return { isValid: false, error: 'Email is required' };
    if (!user.name) return { isValid: false, error: 'Name is required' };
    
    // Main logic at top level
    return { isValid: true };
}

// ❌ Avoid - Nested conditions
function validateUser(user: User | null): ValidationResult {
    if (user) {
        if (user.email) {
            if (user.name) {
                return { isValid: true };
            } else {
                return { isValid: false, error: 'Name is required' };
            }
        } else {
            return { isValid: false, error: 'Email is required' };
        }
    } else {
        return { isValid: false, error: 'User is required' };
    }
}
```

### 4. Dependency Management
- **Interface-Based Dependencies**: Always depend on interfaces, not concrete implementations
- **Constructor Injection**: Use constructor-based dependency injection
- **Single Responsibility**: Each class should have one reason to change

## File Organization

### Directory Structure

#### Backend Structure
```
src/
├── app/
│   └── _actions/          # Server Actions layer
│       ├── {domain}/      # Domain-specific actions
│       │   ├── queries.ts    # Data fetching actions
│       │   └── mutations.ts  # Data modification actions
│       └── shared/        # Shared utilities
│           ├── auth.ts       # Auth helpers
│           ├── response.ts   # Response utilities
│           └── revalidate.ts # Cache revalidation
├── server/
│   ├── domains/           # Business domains
│   │   └── {domain}/      # Domain folder
│   │       ├── index.ts       # Domain exports
│   │       ├── {domain}.service.ts
│   │       ├── {domain}.service.spec.ts
│   │       └── {domain}.repository.ts
│   ├── di/                # Dependency injection containers
│   │   ├── index.ts          # Container exports
│   │   └── {domain}.container.ts
│   ├── db/                # Data access layer
│   │   ├── index.ts          # Database connection
│   │   └── schema.ts         # Database schema
│   └── auth/              # Authentication configuration
│       ├── config.ts         # NextAuth configuration
│       └── index.ts          # Auth exports
```


### Naming Conventions

#### Files and Directories
- **kebab-case** for file and directories names: `admin-agent.service.ts`
- **Descriptive names**: Files should clearly indicate their purpose

#### Classes and Interfaces
- **PascalCase** for classes: `AgentManagementService`, `DrizzleAgentRepository`
- **Interface prefix** when needed: `AdminAgentRepository` (interface), `DrizzleAdminAgentRepository` (implementation)
- **Descriptive suffixes**: `Service`, `Repository`, `Error`

#### Variables and Functions
- **camelCase** for variables and functions: `agentRepository`, `getAgentById`
- **Descriptive names**: Avoid abbreviations unless widely understood
- **Boolean prefixes**: Use `is`, `has`, `can`, `should` for boolean variables

```typescript
// ✅ Good
const isUserAuthorized = checkUserPermissions(user);
const hasActiveConversation = conversation.status === 'active';

// ❌ Avoid
const auth = checkUserPermissions(user);
const active = conversation.status === 'active';
```


## Service Layer Guidelines

### Service Structure
```typescript
export class AgentManagementService {
    constructor(
        private readonly agentRepository: AgentRepository,
        private readonly conversationRepository: ConversationRepository
    ) {}

    // Public methods with comprehensive error handling
    async getAgentById({id, userId}: {id: string, userId: string}): Promise<OperationResult<AIAgent, AgentManagementServiceError>> {
        // Implementation
    }

    // Private helper methods when needed
    private validateAgentAccess(agent: AIAgent, userId: string): boolean {
        // Implementation
    }
}
```

### Service Best Practices
- **Constructor Dependencies**: All dependencies via constructor
- **Readonly Properties**: Mark injected dependencies as `readonly`
- **Method Signatures**: Use object parameters for multiple arguments
- **Error Context**: Always include relevant context in error logs
- **Business Logic Only**: Keep services focused on business rules, not data access

## Repository Layer Guidelines

### Repository Pattern
```typescript
// Interface definition
export interface AgentRepository {
    getMyAgents(userId: string): Promise<AIAgent[]>;
    getAgentById({id, userId}: {id: string, userId: string}): Promise<AIAgent | null>;
}

// Implementation
export class DrizzleAgentRepository implements AgentRepository {
    constructor(private readonly db: DomainDbType) {}

    async getMyAgents(userId: string): Promise<AIAgent[]> {
        const rows = await this.db.select().from(aiAgents)
            .leftJoin(agentAssignments, eq(aiAgents.id, agentAssignments.agentId))
            .where(and(eq(agentAssignments.profileId, userId), isNull(agentAssignments.revokedAt)));
        
        return rows.map(row => row.aiAgent);
    }
}
```

### Repository Best Practices
- **Interface First**: Always define interface before implementation
- **Database Agnostic**: Interfaces should not leak database-specific details
- **Null Handling**: Return `null` for not found, empty arrays for no results
- **Query Optimization**: Use proper joins and indexes
- **Type Safety**: Leverage Drizzle's type system fully

## Server Actions Layer Guidelines

### Server Actions Structure
```typescript
// src/app/_actions/agent/queries.ts
'use server';

import { requireAuth } from '../shared/auth';
import { unwrapResult } from '../shared/response';
import { agentContainer } from '~/server/di';

export async function getMyAgents() {
    const session = await requireAuth();
    const service = agentContainer.resolve('agentManagementService');
    const result = await service.getMyAgents(session.user.id);
    return unwrapResult(result);
}

export async function getAgentById(id: string) {
    const session = await requireAuth();
    const service = agentContainer.resolve('agentManagementService');
    const result = await service.getAgentById({ id, userId: session.user.id });
    return unwrapResult(result);
}
```

### Server Actions Best Practices
- **Input Validation**: Always use Zod schemas for input validation
- **Proper Authentication**: Use appropriate auth helpers (`requireAuth()`, `requireAdmin()`)
- **Service Delegation**: Server Actions should delegate to services, not contain business logic
- **Error Handling**: Use `unwrapResult()` to convert `OperationResult` failures to errors
- **Consistent Naming**: Function names should match their intent (`get`, `create`, `update`, `delete`)
- **Cache Revalidation**: Call appropriate `revalidate*()` functions after mutations

## Database Guidelines

### Schema Design
```typescript
export const aiAgents = createTable('aiAgent', (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    name: d.varchar({ length: 256 }).notNull(),
    description: d.text(),
    systemContext: d.text().notNull(),
    status: agentStatusEnum().default(AgentStatus.ACTIVE).notNull(),
    createdBy: d.uuid().notNull().references(() => users.id),
    createdAt: d.timestamp().defaultNow().notNull(),
    updatedAt: d.timestamp().defaultNow().$onUpdate(() => new Date()).notNull(),
}));
```

### Database Best Practices
- **UUID Primary Keys**: Use UUIDs for all primary keys
- **Audit Fields**: Include `createdAt`, `updatedAt`, `createdBy` where appropriate
- **Foreign Key Constraints**: Always define proper relationships
- **Proper Indexes**: Add indexes for frequently queried columns
- **Enum Types**: Use database enums for constrained values
- **Nullable vs Not Null**: Be explicit about nullable fields

### Query Guidelines
```typescript
// ✅ Good - Specific selection with proper joins
const rows = await this.db.select().from(aiAgents)
    .leftJoin(agentAssignments, eq(aiAgents.id, agentAssignments.agentId))
    .where(and(eq(agentAssignments.profileId, userId), isNull(agentAssignments.revokedAt)));

// ❌ Avoid - Overly broad selection
const rows = await this.db.select().from(aiAgents); // Selects all agents without filtering
```

## Testing Guidelines

### Test Structure
```typescript
describe('AgentManagementService', () => {
    let agentManagementService: AgentManagementService;
    let mockAgentRepository: jest.Mocked<AgentRepository>;
    let mockConversationRepository: jest.Mocked<ConversationRepository>;

    beforeEach(() => {
        mockAgentRepository = {
            getMyAgents: jest.fn(),
            getAgentById: jest.fn(),
        };
        mockConversationRepository = {
            getMyConversations: jest.fn(),
        };
        agentManagementService = new AgentManagementService(mockAgentRepository, mockConversationRepository);
    });

    describe('getAgentById', () => {
        it('should return agent when found', async () => {
            // Test implementation
        });

        it('should return AGENT_NOT_FOUND when agent does not exist', async () => {
            // Test implementation
        });
    });
});
```

### Testing Best Practices
- **Unit Tests**: Test services with mocked dependencies
- **Integration Tests**: Test repositories with test database
- **Descriptive Names**: Test names should describe the scenario and expected outcome
- **AAA Pattern**: Arrange, Act, Assert structure
- **Mock External Dependencies**: Always mock external services and databases in unit tests
- **Test Error Paths**: Test both success and failure scenarios

## Code Quality

### ESLint Configuration
- **Strict Rules**: Maintain strict ESLint configuration
- **Type-Aware Rules**: Use TypeScript-specific ESLint rules
- **Import Organization**: Organize imports consistently
- **Alphabetical Sorting**: All imports and exports must be sorted alphabetically

#### Import and Export Sorting Rules
- **Import Groups**: Imports are organized into groups (builtin, external, internal, relative) with blank lines between groups
- **Alphabetical Order**: Within each group, imports are sorted alphabetically (case-insensitive)
- **Named Imports**: Named imports within import statements are sorted alphabetically
- **Destructuring**: Object destructuring assignments are sorted alphabetically
- **Export Placement**: All exports must come after imports

```typescript
// ✅ Good - Properly sorted imports and exports
import { readFile } from 'node:fs/promises';

import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';
import { z } from 'zod';

import type { AIAgent } from '~/types/agent';
import { db } from '~/server/db';

import { validateInput } from '../utils/validation';
import { formatResponse } from './helpers';

// Named imports are sorted alphabetically
import { createAgent, archiveAgent, getAgent, updateAgent } from './agent.service';

// Destructuring is sorted alphabetically
const { agentId, description, name, systemContext } = agentData;

// Exports come after all imports
export { AgentManagementService };
export type { AgentManagementServiceError };

// ❌ Avoid - Unsorted imports and exports
import { z } from 'zod';
import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';

import { db } from '~/server/db';
import type { AIAgent } from '~/types/agent';

import { formatResponse } from './helpers';
import { validateInput } from '../utils/validation';

export { AgentManagementService }; // Export before all imports are done
```

#### Automated Enforcement
These sorting rules are automatically enforced by:
- **ESLint**: `import/order`, `sort-imports`, `sort-destructure-keys/sort-destructure-keys` rules
- **Prettier**: `@trivago/prettier-plugin-sort-imports` plugin with `importOrderSortSpecifiers: true`
- **IDE Integration**: Most editors will show violations and can auto-fix on save

Run `pnpm lint:fix` and `pnpm format:write` to automatically apply these sorting rules to your codebase.

### Documentation
```typescript
/**
 * Retrieves all agents assigned to a specific user
 * @param userId - The ID of the user to fetch agents for
 * @returns Promise resolving to an array of assigned agents
 */
async getMyAgents(userId: string): Promise<AIAgent[]> {
    // Implementation
}
```

### Performance Considerations
- **Avoid N+1 Queries**: Use proper joins instead of multiple queries
- **Connection Pooling**: Reuse database connections
- **Lazy Loading**: Don't load unnecessary data
- **Proper Indexes**: Ensure database queries are optimized

## Security Guidelines

### Input Validation
- **Zod Schemas**: Always validate inputs with Zod
- **Sanitization**: Sanitize user inputs to prevent injection attacks
- **Type Coercion**: Be explicit about type coercion

### Authentication & Authorization
```typescript
// ✅ Good - Check authorization in service layer
async getAgentById({id, userId}: {id: string, userId: string}): Promise<OperationResult<AIAgent, AgentManagementServiceError>> {
    // Service handles user-specific filtering
    const result = await this.agentRepository.getAgentById({id, userId});
    // ...
}

// ❌ Avoid - Relying only on router-level authorization
async getAgentById(id: string): Promise<AIAgent> {
    // No user context, potential security issue
    return await this.agentRepository.getAgentById(id);
}
```

### Data Access
- **Principle of Least Privilege**: Only query data the user has access to
- **User Context**: Always include user context in data access operations
- **Audit Logging**: Log sensitive operations for audit trails

## Common Patterns

### Service Resolution in Server Actions
```typescript
// src/app/_actions/agent/queries.ts
'use server';

import { requireAuth } from '../shared/auth';
import { unwrapResult } from '../shared/response';
import { agentContainer } from '~/server/di';

// Resolve service from container in each Server Action
export async function getAgentById(id: string) {
    const session = await requireAuth();
    const service = agentContainer.resolve('agentManagementService');
    const result = await service.getAgentById({ id, userId: session.user.id });
    return unwrapResult(result);
}
```

### Error Handling in Server Actions
```typescript
// src/app/_actions/agent/mutations.ts
'use server';

import { requireAuth } from '../shared/auth';
import { unwrapResult } from '../shared/response';
import { revalidateAgents } from '../shared/revalidate';
import { agentContainer } from '~/server/di';

export async function createAgent(data: AgentCreateInput) {
    const session = await requireAuth();
    const service = agentContainer.resolve('agentManagementService');
    const result = await service.createAgent({ ...data, userId: session.user.id });
    const agent = await unwrapResult(result);  // Throws on error
    revalidateAgents();
    return agent;
}
```

### Database Queries with Filtering
```typescript
async getMyAgents(userId: string): Promise<AIAgent[]> {
    const rows = await this.db.select().from(aiAgents)
        .leftJoin(agentAssignments, eq(aiAgents.id, agentAssignments.agentId))
        .where(and(
            eq(agentAssignments.profileId, userId), 
            isNull(agentAssignments.revokedAt)
        ));
    
    return rows.map(row => row.aiAgent);
}
```

## Migration and Refactoring

### Adding New Features
1. **Types First**: Define TypeScript types in `~/shared/types/` and `~/shared/validation/`
2. **Database Schema**: Update schema if needed
3. **Repository Interface**: Define data access contract in domain `lib.types.ts`
4. **Repository Implementation**: Implement with Drizzle in domain repositories
5. **Service Layer**: Add business logic in domain services
6. **DI Container**: Register services and repositories in `~/server/di/{domain}.container.ts`
7. **Server Actions**: Create queries and mutations in `~/app/_actions/{domain}/`
8. **Tests**: Add comprehensive tests

### Breaking Changes
- **Deprecation Path**: Provide migration path for breaking changes
- **Version Compatibility**: Maintain backward compatibility when possible
- **Documentation Updates**: Update all relevant documentation

## External Libraries and Dependencies

### Standardized Library Usage

The codebase follows a consistent approach to external library selection and usage to maintain code consistency, reduce bundle size, and ensure predictable behavior across the application.

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

export function formatAgentCreatedDate(createdAt: string) {
    const date = parseISO(createdAt);
    return format(date, 'MMM dd, yyyy');
}

export function isAgentExpired(expiryDate: string) {
    const expiry = parseISO(expiryDate);
    return isAfter(new Date(), expiry);
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
    return { isValid: false, error: 'Invalid date' };
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

export function groupAgentsByCategory(agents: AIAgent[]) {
    // Use lodash for complex grouping operations
    const grouped = groupBy(agents, 'category');
    return grouped;
}

export function sanitizeAgentData(agentData: any) {
    // Use lodash for object manipulation
    const sanitized = pick(agentData, ['name', 'description', 'category']);
    return sanitized;
}

export function validateAgentList(agents: AIAgent[]) {
    // Use lodash for validation
    if (isEmpty(agents)) {
        return { isValid: false, error: 'No agents found' };
    }
    
    const uniqueAgents = uniqBy(agents, 'id');
    return { isValid: true, agents: uniqueAgents };
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
    return { isValid: false, error: 'Invalid data' };
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

## Tools and Automation

### Development Tools
- **TypeScript**: Strict mode enabled
- **ESLint**: Comprehensive linting rules
- **Prettier**: Consistent code formatting
- **Jest**: Unit and integration testing
- **Drizzle Studio**: Database inspection and management

### Pre-commit Checks
- **Type Checking**: `tsc --noEmit`
- **Linting**: `eslint --fix`
- **Testing**: `jest --passWithNoTests`
- **Formatting**: `prettier --write`
- **Library Usage Validation**: Ensure consistent external library usage patterns

## Conclusion

These guidelines ensure our codebase remains maintainable, type-safe, and scalable across all layers of the application. When in doubt, prioritize:

1. **Type Safety** over convenience
2. **Explicit Error Handling** over implicit failures
3. **Interface Segregation** over large contracts
4. **Testability** over tight coupling
5. **Security** over performance (when they conflict)
6. **Return Early** over nested conditions
7. **Consistent Library Usage** over ad-hoc implementations

Always consider the long-term maintainability of your code and follow the principle of least surprise for other developers. These guidelines apply to both frontend and backend development, ensuring consistency across the entire application stack.

For frontend-specific guidelines including React components, hooks, state management, and accessibility, see the [Frontend Guidelines](./frontend.md) document.
