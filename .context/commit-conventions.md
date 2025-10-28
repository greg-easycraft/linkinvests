# Commit Conventions

This project enforces conventional commits with a maximum message length of 50 characters to maintain clean and consistent git history.

## Commit Message Format

```
<type>: <description>
```

### Maximum Length
- **Header**: Maximum 50 characters (enforced by commitlint)
- **Description**: Should be concise and descriptive

### Commit Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat: add user authentication` |
| `fix` | Bug fix | `fix: resolve login redirect issue` |
| `docs` | Documentation changes | `docs: update API documentation` |
| `style` | Code style changes | `style: format user service` |
| `refactor` | Code refactoring | `refactor: extract auth utilities` |
| `perf` | Performance improvements | `perf: optimize database queries` |
| `test` | Adding or updating tests | `test: add user service tests` |
| `chore` | Maintenance tasks | `chore: update dependencies` |
| `ci` | CI/CD changes | `ci: add deployment workflow` |
| `build` | Build system changes | `build: update webpack config` |
| `revert` | Reverting commits | `revert: undo feature X changes` |

## Examples

### ✅ Good Commit Messages
```bash
feat: add password reset functionality
fix: handle null user in auth middleware  
docs: add API endpoint documentation
test: add integration tests for agents
chore: update eslint configuration
```

### ❌ Bad Commit Messages
```bash
# Too long (over 50 characters)
feat: add comprehensive user authentication system with OAuth integration

# Not conventional format
Added new feature for users
fixed bug
Update documentation

# Missing type
add user login feature

# Ends with period
feat: add user login feature.
```

## Validation

The project uses:
- **commitlint**: Validates commit message format and length
- **husky**: Git hooks to enforce validation before commits

### Manual Validation
You can manually check your last commit message:
```bash
pnpm commit:check
```

### Testing Commit Messages
To test a commit message without committing:
```bash
echo "feat: test commit message" | pnpm exec commitlint
```

## Git Hooks

### Pre-commit Hook
Runs before each commit:
- TypeScript type checking
- ESLint with auto-fix
- Code formatting validation

### Commit-msg Hook
Validates commit messages:
- Conventional commit format
- Maximum 50 character length
- Required fields (type, description)

## Tips for Writing Good Commit Messages

1. **Be concise**: Use the 50-character limit effectively
2. **Use imperative mood**: "add" not "added" or "adds"
3. **Focus on what**: Describe what the commit does, not how
4. **Group related changes**: Make atomic commits
5. **Use conventional types**: Stick to the predefined types

### Examples of Concise Messages
```bash
# Instead of: "feat: add new user authentication system"
feat: add user authentication

# Instead of: "fix: resolve the issue with login redirect"
fix: resolve login redirect issue

# Instead of: "docs: update the API documentation for users"
docs: update user API docs
```

## Troubleshooting

### Commit Rejected
If your commit is rejected:
1. Check the error message from commitlint
2. Ensure your message follows the format: `<type>: <description>`
3. Verify the message is under 50 characters
4. Use one of the allowed commit types

### Bypassing Validation (Not Recommended)
In exceptional cases, you can bypass validation:
```bash
git commit --no-verify -m "emergency fix"
```

**Note**: This should only be used in emergencies and the commit should be amended later to follow conventions.
