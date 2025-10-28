## Testing principles

### Scope and levels
- **Unit tests (server domains)**: Validate service logic and pure functions in isolation. Avoid hitting the database; mock repositories and IO.
- **Repository tests (e2e-spec.ts)**: Integration tests that validate repository implementations against a real test database. Test database interactions, SQL logic, and data transformations.
- **Component tests (app/_components)**: Test UI behavior and rendering. Keep tests fast and focused on user-observable outcomes.
- **Integration tests (where meaningful)**: Validate multiple units working together (e.g., complex components) without external services.

### Structure and placement
- **Co-locate tests with code**: Server/domain unit tests live next to the code (e.g., `*.service.spec.ts`).
- **Repository integration tests**: Use `*.e2e-spec.ts` suffix for repository tests that hit the database.
- **Descriptive names**: Use `*.spec.ts`/`*.test.tsx` with clear `describe`/`it` blocks reflecting behavior, not implementation.

### Mocking strategy
- **Class mocking**: Use `mockClass` from `src/test-utils/mock-class.ts` to generate typed jest mocks for repositories/services.
- **Interface mocking**: When testing services that depend on interfaces, mock using the concrete implementation class. Example: `mockClass(DrizzleProfileRepository)` instead of the interface type.
- **Resolve/reject explicitly**: Drive branches by setting `mockResolvedValueOnce` and `mockRejectedValueOnce`.
- **No real DB/HTTP**: Unit tests must not touch the network or database. All external boundaries are mocked.

### OperationResult pattern
- **Success path**: Expect `succeed(payload)` when operations complete normally.
- **Error path**: Expect `refuse(ErrorEnum.VALUE)` for domain errors and unknown failures.
- **Branch coverage**: Cover success, not-found/validation, and thrown-error paths for each public method.

### Test style
- **AAA pattern**: Arrange (mocks/data), Act (call the function), Assert (outcome only).
- **Deterministic fixtures**: Use simple constants like `DUMMY_AGENT` for readability and stability.
- **Minimal assertions**: Assert outcomes, not internal calls, unless behavior depends on them.
- **Reset state**: `beforeEach(jest.clearAllMocks)` to avoid test coupling.
- **Assertion preference**: Use `toEqual()` over `toBe()` for value comparisons. `toEqual()` performs deep equality checks and is more reliable for objects, arrays, and complex values. Reserve `toBe()` only for reference equality or primitive identity checks.
- **Content vs shape matching**: Prefer `expect(received).toEqual(expectedFixture)` over `expect(received).toMatchObject({...})` when testing complete object retrieval from databases. This ensures all properties are correctly populated and not just the shape.

### Repository interaction expectations
- **When to assert calls**: If a service method’s contract includes delegating to a repository with specific arguments or exactly-once semantics, assert calls in addition to outcomes.
- **How to assert**:
  - `expect(repo.method).toHaveBeenCalledTimes(1)` to ensure single delegation.
  - `expect(repo.method).toHaveBeenCalledWith(args)` to ensure correct arguments.
- **Argument shapes**: For generated values, use matchers like `expect.any(String)` or fixed system time via `jest.useFakeTimers().setSystemTime(...)` to keep assertions stable.
- **ESLint note**: If your linter flags unbound jest method references, either add a file header `/* eslint-disable @typescript-eslint/unbound-method */` or place a local disable above the specific `expect(repo.method)` line.

### UI testing specifics
- **User-centric assertions**: Prefer checking rendered text/roles/states over internal props/state.
- **Accessibility-first**: Query by role/label when possible.
- **Async UI**: Use async utils and await updates for loading/error states.

### Logger testing
- **Mock logger in unit tests**: Use `jest.mock('~/utils', () => ({ logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() } }))` to mock the logger for unit tests.
- **Assert log calls when behavior depends on them**: Test that appropriate log levels are called with correct context for security events, error conditions, and important business operations.
- **Verify log context**: Assert that log calls include expected context fields (userId, agentId, operation, etc.) for debugging and monitoring purposes.
- **Test error logging**: Ensure errors are logged with full context and appropriate log levels in catch blocks.
- **Don't test log output format**: Focus on verifying that logging calls are made with correct parameters, not the actual log message formatting.

```typescript
// Mock logger for unit tests
jest.mock('~/utils', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

import { logger } from '~/utils';

describe('AgentManagementService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should log debug info when fetching agent', async () => {
    const result = await agentManagementService.getAgentById({ id: 'agent-1', userId: 'user-1' });
    
    expect(logger.debug).toHaveBeenCalledWith(
      { agentId: 'agent-1', userId: 'user-1' },
      'Service: Fetching agent by ID'
    );
  });

  it('should log error with context when repository throws', async () => {
    const error = new Error('Database connection failed');
    mockRepository.getAgentById.mockRejectedValueOnce(error);
    
    const result = await agentManagementService.getAgentById({ id: 'agent-1', userId: 'user-1' });
    
    expect(logger.error).toHaveBeenCalledWith(
      { error, agentId: 'agent-1', userId: 'user-1' },
      'Service: Error fetching agent by ID'
    );
    expect(result).toEqual(refuse(AgentManagementServiceError.UNKNOWN_ERROR));
  });

  it('should log security events with appropriate context', async () => {
    const result = await authService.validateLogin({ email: 'test@example.com', password: 'wrong' });
    
    expect(logger.warn).toHaveBeenCalledWith(
      { email: 'test@example.com', attemptCount: 1, action: 'failed_login' },
      'Login attempt failed'
    );
  });
});
```

### What we don't test
- **Implementation details**: Don't assert private internals or log output formatting.
- **Library behavior**: Assume framework/library correctness; test our integration with them.
- **Log message text**: Focus on verifying log calls are made with correct context, not the exact message text.

### Repository testing specifics
- **Real database**: Repository tests (`*.e2e-spec.ts`) use a real test database via `useTestDb()` to validate SQL queries and database interactions.
- **Test isolation**: Each test gets a clean database state via `beforeEach` reset and fixture injection.
- **Fixture-based data**: Use predefined fixtures (e.g., `AGENT_1`, `PROFILE_1`) from `~/test-utils/fixtures` for consistent, readable test data.
- **Database-specific testing**: Test both success paths (data found) and edge cases (null returns, non-existent IDs).
- **Direct repository instantiation**: Create repository instances directly with the test database, no mocking needed.
- **CRUD operation coverage**: Test all repository methods - create, read (by ID/email/all), update, and custom operations (block/unblock).
- **Data verification**: After state-changing operations (create, update, block), verify changes by re-querying the database.
- **Constraint testing**: Test database constraints (e.g., unique email) by attempting to violate them and expecting appropriate errors.
- **Complex query validation**: For methods returning computed data (e.g., `UserWithStatus`), verify both structure and data types of returned fields.
- **Non-existent resource handling**: Always test operations against non-existent resources to ensure proper null/false returns.
- **Content equality over shape matching**: When fetching objects from the database, assert the complete content using `expect(received).toEqual(FIXTURE_OBJECT)` instead of partial shape matching with `toMatchObject()`.
- **Integration testing**: Test the integration between different repository methods (e.g., create then retrieve, update then verify).
- **Edge case coverage**: Test with malformed data, empty strings, very long content, special characters, and concurrent access scenarios.
- **Ordering validation**: When testing ordered results, verify the actual ordering logic (e.g., by step number, last activity).
- **JSON field handling**: Test proper serialization/deserialization of JSON fields (e.g., agenda objects).

### Utilities and helpers
- **`src/test-utils`**: Centralized helpers (e.g., `mockClass`, env mocks). Prefer these over ad-hoc mocks.
- **`useTestDb()`**: Test database setup utility that handles schema migration, data cleanup, and fixture injection.
- **Consistent enums/types**: Import shared types and error enums from `src/types` and domain modules to keep tests aligned with domain language.

---

## Examples

### Unit test with mockClass and OperationResult
```ts
import { mockClass } from "~/test-utils";
import { DrizzleAdminAgentRepository } from "~/server/domains/agents/admin-agent.repository";
import { AdminAgentManagementService, AdminAgentManagementServiceError } from "~/server/domains/agents/admin-agent.service";
import { AgentStatus, type AIAgent } from "~/types/agent";
import { succeed, refuse } from "~/utils";

const DUMMY_AGENT: AIAgent = {
  id: "1",
  name: "Dummy Admin Agent",
  description: "Desc",
  systemContext: "System",
  status: AgentStatus.ACTIVE,
  createdAt: new Date(),
  createdBy: "admin",
  updatedAt: new Date(),
};

describe("AdminAgentManagementService", () => {
  const repo = mockClass(DrizzleAdminAgentRepository);
  repo.getAgentById.mockResolvedValue(DUMMY_AGENT);
  const service = new AdminAgentManagementService(repo);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns agent when found", async () => {
    const result = await service.getAgentById("1");
    expect(result).toEqual(succeed(DUMMY_AGENT));
    expect(repo.getAgentById).toHaveBeenCalledTimes(1);
    expect(repo.getAgentById).toHaveBeenCalledWith("1");
  });

  it("returns not found when repo returns null", async () => {
    repo.getAgentById.mockResolvedValueOnce(null);
    const result = await service.getAgentById("missing");
    expect(result).toEqual(refuse(AdminAgentManagementServiceError.AGENT_NOT_FOUND));
    expect(repo.getAgentById).toHaveBeenCalledTimes(1);
    expect(repo.getAgentById).toHaveBeenCalledWith("missing");
  });

  it("returns unknown error when repo throws", async () => {
    repo.getAgentById.mockRejectedValueOnce(new Error("db error"));
    const result = await service.getAgentById("1");
    expect(result).toEqual(refuse(AdminAgentManagementServiceError.UNKNOWN_ERROR));
    expect(repo.getAgentById).toHaveBeenCalledTimes(1);
    expect(repo.getAgentById).toHaveBeenCalledWith("1");
  });
});
```

### Asserting argument shapes with generated fields
```ts
import { type AiAgentCreationInput, AgentStatus, type AIAgent } from "~/types/agent";

const FIXED_DATE = new Date("2020-01-01T00:00:00.000Z");

describe("createAgent", () => {
  const repo = mockClass(DrizzleAdminAgentRepository);
  const service = new AdminAgentManagementService(repo);

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(FIXED_DATE);
  });

  const input: AiAgentCreationInput = {
    name: "Name",
    description: "Desc",
    systemContext: "Ctx",
    createdBy: "admin",
  };

  it("passes constructed entity to repository with generated fields", async () => {
    const expected: AIAgent = {
      id: expect.any(String),
      ...input,
      status: AgentStatus.ACTIVE,
      createdAt: FIXED_DATE,
      updatedAt: FIXED_DATE,
    };

    repo.createAgent.mockResolvedValueOnce(expected);

    const result = await service.createAgent(input);
    expect(repo.createAgent).toHaveBeenCalledTimes(1);
    expect(repo.createAgent).toHaveBeenCalledWith(expected);
    expect(result).toEqual(succeed(expected));
  });
});
```

### Driving branches with resolve/reject
```ts
repo.getAllAgents.mockResolvedValueOnce([DUMMY_AGENT]); // success branch
repo.getAllAgents.mockRejectedValueOnce(new Error("boom")); // error branch
```

### Repository integration test
```ts
import { useTestDb } from '~/test-utils';
import { AGENT_1, PROFILE_1 } from '~/test-utils/fixtures';
import { DrizzleAgentRepository } from './agent.repository';

describe('DrizzleAgentRepository Integration Tests', () => {
  const db = useTestDb();
  const repo = new DrizzleAgentRepository(db);

  describe('getAgentById', () => {
    it('should return agent with all properties', async () => {
      const result = await repo.getAgentById({
        id: AGENT_1.id,
        profileId: PROFILE_1.id,
      });

      // Use content equality instead of shape matching
      expect(result).toEqual(AGENT_1);
    });

    it('should return null when agent does not exist', async () => {
      const nonExistentAgentId = crypto.randomUUID();

      const result = await repo.getAgentById({
        id: nonExistentAgentId,
        profileId: PROFILE_1.id,
      });

      expect(result).toBeNull();
    });

    it('should return null when user does not have assignment', async () => {
      // Try to get AGENT_1 with PROFILE_3 (who doesn't have assignment to AGENT_1)
      const result = await repo.getAgentById({
        id: AGENT_1.id,
        profileId: PROFILE_3.id,
      });

      expect(result).toBeNull();
    });
  });

  describe('integration between create and retrieve', () => {
    it('should return created document via getDocumentByConversationId', async () => {
      const documentData: GeneratedDocumentUpsertInput = {
        conversationId: AGENT_SESSION_4.id,
        name: 'Integration Test Document',
        content: '# Integration Test\n\nThis tests the integration.',
        format: 'markdown',
        qualityScore: 88,
      };

      const createdDocument = await repo.upsertConversationDocument(documentData);
      const retrievedDocument = await repo.getDocumentByConversationId({
        conversationId: AGENT_SESSION_4.id,
      });

      expect(retrievedDocument).toEqual(createdDocument);
    });
  });

  describe('edge cases', () => {
    it('should handle documents with very long content', async () => {
      const header = '# Long Document\n\n';
      const longContent = header + 'A'.repeat(10000);
      const documentData: GeneratedDocumentUpsertInput = {
        conversationId: AGENT_SESSION_4.id,
        name: 'Long Document',
        content: longContent,
        format: 'markdown',
      };

      const result = await repo.upsertConversationDocument(documentData);

      expect(result.content).toEqual(longContent);
      expect(result.content.length).toEqual(10000 + header.length);
    });

    it('should handle documents with special characters in content', async () => {
      const specialContent =
        '# Special Characters\n\n`code` **bold** *italic* [link](url)';
      const documentData: GeneratedDocumentUpsertInput = {
        conversationId: AGENT_SESSION_4.id,
        name: 'Special Characters Document',
        content: specialContent,
        format: 'markdown',
      };

      const result = await repo.upsertConversationDocument(documentData);

      expect(result.content).toEqual(specialContent);
    });
  });
});
```

### Service unit test with interface mocking
```ts
/* eslint-disable @typescript-eslint/unbound-method */
import { mockClass } from '~/test-utils';
import { DrizzleAdminProfileRepository } from '../repositories';
import { AdminProfileService, AdminProfileServiceError } from './admin-user.service';

describe('AdminProfileService', () => {
  // Mock the concrete implementation class, not the interface
  const mockUserRepository = mockClass(DrizzleAdminProfileRepository);
  const profileService = new AdminProfileService(mockUserRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfileById', () => {
    it('should return user with status when found', async () => {
      mockUserRepository.getProfileById.mockResolvedValueOnce(DUMMY_PROFILE);

      const result = await profileService.getProfileById('1');

      expect(result).toEqual(succeed(DUMMY_PROFILE));
      expect(mockUserRepository.getProfileById).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.getProfileById).toHaveBeenCalledWith('1');
    });

    it('should return user not found when repository returns null', async () => {
      mockUserRepository.getProfileById.mockResolvedValueOnce(null);

      const result = await profileService.getProfileById('missing');

      expect(result).toEqual(
        refuse(AdminProfileServiceError.PROFILE_NOT_FOUND)
      );
      expect(mockUserRepository.getProfileById).toHaveBeenCalledTimes(1);
    });
  });
});
```
