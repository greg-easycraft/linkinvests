# Qualiop'Easy Project - Always reference these documentation files:

## Required Context Files
Please always reference and follow the guidelines from these files:
- `.context/coding-guidelines.md` - Follow all coding standards and patterns
- `.context/backend-architecture.md` - Understand the system architecture 
- `.context/frontend.md` - Understand the frontend guidelines
- `.context/testing.md` - Follow testing practices

## Instructions
When providing code suggestions or answering questions:
1. Always check the coding guidelines first
2. Consider the backend architecture patterns
3. Follow the testing practices outlined in the docs
4. Maintain consistency with existing patterns in the codebase
5. After every code change, you should check for typescript errors and fix them. Then, check for linting errors and fix them.

To check for TS errors, use `pnpm typecheck`.
To check for linting errors, use `pnpm lint:fix`.
To run tests, use `pnpm test`.
To run repository integration tests, use `pnpm test:e2e`.
To run UI tests, use `pnpm test:ui`.

Prioritize the documentation in these files over general best practices when they conflict.

if prompting for multi answers questions, use space for select/unselect and enter for submission.