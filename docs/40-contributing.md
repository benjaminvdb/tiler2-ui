# Contributing

This document outlines how to contribute to the project, including code standards, branch naming, commit messages, and the pull request process.

## Code of Conduct

### Our Commitment

We are committed to providing a welcoming and inspiring community for all. Please treat all contributors with respect.

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Trolling, insulting/derogatory comments
- Public or private harassment
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

## Getting Started

### Prerequisites

- Node.js 20+ and pnpm 8+
- Git configured with your name and email
- Code editor (VS Code recommended)
- Basic understanding of React, TypeScript, and Git

### Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/tiler2-ui.git
cd tiler2-ui

# Add upstream remote
git remote add upstream https://github.com/langchain-ai/agent-chat-ui.git

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Syncing Your Fork

```bash
# Fetch upstream changes
git fetch upstream

# Merge into your local branch
git checkout main
git merge upstream/main

# Push to your fork
git push origin main
```

## Branch Naming

### Branch Name Format

```
<type>/<short-description>
```

### Types

- **feat/** - New features
- **fix/** - Bug fixes
- **docs/** - Documentation changes
- **style/** - Code style changes (formatting, no logic change)
- **refactor/** - Code refactoring (no feature change)
- **perf/** - Performance improvements
- **test/** - Adding or updating tests
- **chore/** - Maintenance tasks (dependencies, config)

### Examples

```bash
# Good branch names
git checkout -b feat/add-message-search
git checkout -b fix/auth-redirect-loop
git checkout -b docs/update-api-integration
git checkout -b refactor/simplify-stream-provider

# Bad branch names
git checkout -b my-feature
git checkout -b fix
git checkout -b john-updates
```

**Why:** Descriptive branch names make it clear what changes are being worked on.

## Commit Message Format

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

Same as branch types:
- **feat** - New feature
- **fix** - Bug fix
- **docs** - Documentation
- **style** - Formatting
- **refactor** - Code restructuring
- **perf** - Performance
- **test** - Tests
- **chore** - Maintenance

### Scope

Optional, specifies the area of change:
- **auth** - Authentication
- **chat** - Chat system
- **thread** - Thread management
- **artifacts** - Artifacts panel
- **ui** - UI components
- **api** - API integration
- **deps** - Dependencies

### Subject

- Imperative mood ("add" not "added")
- No capitalization
- No period at the end
- Maximum 50 characters

### Examples

```bash
# Good commits
git commit -m "feat(chat): add message search functionality"
git commit -m "fix(auth): resolve redirect loop on login"
git commit -m "docs: update API integration guide"
git commit -m "refactor(thread): simplify message state management"

# With body
git commit -m "feat(artifacts): add syntax highlighting

Implement syntax highlighting for code artifacts using
react-syntax-highlighter. Supports all major languages
and includes copy-to-clipboard functionality.

Closes #123"

# Bad commits
git commit -m "fixed bug"
git commit -m "Updated code"
git commit -m "WIP"
```

**Why:** Consistent commit messages create a readable project history and help with automated changelog generation.

### Commit Message Guidelines

1. **Separate subject from body** with a blank line
2. **Limit subject to 50 characters**
3. **Capitalize the subject line** (optional in this project)
4. **Do not end subject with a period**
5. **Use imperative mood** in the subject
6. **Wrap body at 72 characters**
7. **Explain what and why**, not how

## Code Standards

### TypeScript

```typescript
// Use explicit types
function sendMessage(content: string): Promise<Message> {
  // Implementation
}

// Avoid any
const data: unknown = fetchData();

// Use interfaces for object shapes
interface ThreadProps {
  threadId: string;
  onClose: () => void;
}
```

### React

```typescript
// Function components with TypeScript
export function ChatInput({ onSubmit }: ChatInputProps) {
  // Implementation
}

// Use hooks appropriately
const [state, setState] = useState<ThreadState>(initialState);
const memoizedValue = useMemo(() => expensiveComputation(), [deps]);

// Destructure props
function Component({ title, children }: ComponentProps) {
  return <div>{title}{children}</div>;
}
```

### File Naming

- **Components:** PascalCase (`ChatInput.tsx`)
- **Utilities:** kebab-case (`format-date.ts`)
- **Hooks:** camelCase with "use" prefix (`useThread.ts`)
- **Types:** PascalCase (`ThreadState`, `Message`)
- **Constants:** SCREAMING_SNAKE_CASE (`API_BASE_URL`)

### Code Organization

```typescript
// 1. Imports (grouped)
import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

import type { Message } from "@/shared/types";
import { formatMessage } from "@/shared/utils";

// 2. Types/Interfaces
interface Props {
  // ...
}

// 3. Constants
const MAX_MESSAGES = 100;

// 4. Component
export function Component({ prop }: Props) {
  // 5. Hooks
  const [state, setState] = useState();
  const { user } = useAuth0();

  // 6. Functions
  const handleSubmit = () => {
    // ...
  };

  // 7. Effects
  useEffect(() => {
    // ...
  }, []);

  // 8. Render
  return <div>...</div>;
}
```

## Pull Request Process

### Before Opening PR

- [ ] Code follows project conventions
- [ ] All ESLint errors fixed (`pnpm lint`)
- [ ] Code formatted (`pnpm format`)
- [ ] TypeScript compiles (`pnpm check`)
- [ ] Tests pass (when added)
- [ ] Documentation updated (if needed)
- [ ] No console.log or debugger statements
- [ ] Branch is up to date with main

### PR Title Format

Same as commit messages:
```
<type>(<scope>): <description>
```

Examples:
```
feat(chat): add message search
fix(auth): resolve redirect loop
docs: update contributing guide
```

### PR Description Template

```markdown
## Summary
Brief description of what this PR does.

## Motivation
Why is this change needed? What problem does it solve?

## Changes
- Added X feature
- Fixed Y bug
- Updated Z documentation

## Testing
How was this tested?
- [ ] Manual testing
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] E2E tests added

## Screenshots
(If applicable)

## Breaking Changes
(If applicable)

## Related Issues
Closes #123
```

### PR Review Process

1. **Submit PR** - Push your branch and open PR
2. **Automated checks** - CI runs linting, type checking, tests
3. **Code review** - Maintainers review your code
4. **Address feedback** - Make requested changes
5. **Approval** - PR is approved by maintainer(s)
6. **Merge** - PR is merged by maintainer

### Addressing Review Comments

```bash
# Make changes based on feedback
git add .
git commit -m "refactor: address review feedback"
git push origin feat/your-feature

# Or amend last commit (if appropriate)
git add .
git commit --amend --no-edit
git push origin feat/your-feature --force
```

**Note:** Only force push to your own feature branches, never to main.

## Code Review Guidelines

### As a Reviewer

#### Focus Areas

1. **Correctness** - Does the code work as intended?
2. **Design** - Is the design appropriate?
3. **Complexity** - Is it more complex than needed?
4. **Tests** - Are there appropriate tests?
5. **Naming** - Are names clear and descriptive?
6. **Documentation** - Are complex parts documented?
7. **Style** - Does it follow project conventions?

#### Providing Feedback

```markdown
# Be specific
❌ "This could be better"
✅ "Consider extracting this into a separate hook for reusability"

# Be kind
❌ "This is wrong"
✅ "This might not work when X happens. Have you considered Y?"

# Explain why
❌ "Use useMemo here"
✅ "This calculation runs on every render. useMemo would improve performance"

# Suggest alternatives
❌ "Don't do this"
✅ "Instead of X, consider Y because Z"
```

#### Comment Prefixes

- **nit:** Minor style/formatting suggestion (non-blocking)
- **question:** Asking for clarification
- **suggestion:** Alternative approach
- **issue:** Potential bug or problem
- **blocking:** Must be addressed before merge

### As a Contributor

- **Be receptive** to feedback
- **Ask questions** if feedback is unclear
- **Explain your approach** if you disagree
- **Be patient** - reviews take time
- **Thank reviewers** for their time

## Development Workflow

### Standard Workflow

```bash
# 1. Create branch from main
git checkout main
git pull origin main
git checkout -b feat/your-feature

# 2. Make changes
# Edit files...

# 3. Test changes
pnpm dev
# Test manually in browser

# 4. Run quality checks
pnpm lint
pnpm format
pnpm check

# 5. Commit changes
git add .
git commit -m "feat: add new feature"

# 6. Push to your fork
git push origin feat/your-feature

# 7. Open PR on GitHub
```

### Updating PR with Main

```bash
# Fetch latest main
git checkout main
git pull origin main

# Rebase your branch
git checkout feat/your-feature
git rebase main

# Resolve any conflicts
# Edit conflicted files...
git add .
git rebase --continue

# Force push (if rebased)
git push origin feat/your-feature --force
```

## Testing Guidelines

### Manual Testing

Before submitting PR:
1. Test the happy path
2. Test error cases
3. Test edge cases (empty input, very long input, etc.)
4. Test on different browsers (Chrome, Firefox)
5. Test responsive design (mobile, tablet, desktop)

### Automated Testing (When Added)

```bash
# Run all tests
pnpm test

# Run specific test
pnpm test src/features/chat/chat-input.test.tsx

# Run with coverage
pnpm test --coverage
```

## Documentation

### When to Update Docs

Update documentation when:
- Adding new features
- Changing existing behavior
- Modifying configuration
- Adding dependencies
- Changing environment variables

### Documentation Files

- **README.md** - Project overview, quick start
- **docs/*.md** - Detailed documentation
- **Code comments** - Complex logic explanation
- **.env.example** - Environment variable documentation

### Writing Documentation

```markdown
# Good documentation

## Clear Structure
Use headers to organize content

## Code Examples
\`\`\`typescript
// Always include runnable examples
function example() {
  return "code";
}
\`\`\`

## Why, Not Just What
Explain WHY, not just WHAT the code does.

## Keep It Updated
Update docs with code changes
```

## Release Process

### Versioning

This project uses semantic versioning (when releases are created):
- **Major (1.0.0)** - Breaking changes
- **Minor (0.1.0)** - New features (backward compatible)
- **Patch (0.0.1)** - Bug fixes

### Creating Releases

Releases are handled by maintainers. Contributors focus on:
1. Making quality contributions
2. Following conventions
3. Writing good commit messages
4. Updating documentation

## Questions and Support

### Where to Get Help

- **Issues** - Report bugs or request features
- **Discussions** - Ask questions or discuss ideas
- **Documentation** - Read project docs
- **Code comments** - Understand complex logic

### Asking Good Questions

```markdown
# Bad question
"It doesn't work"

# Good question
"When I try to send a message in thread X, I get error Y. Here's what I tried:
1. ...
2. ...

Expected: Message should send
Actual: Error "Z" appears

Environment:
- Browser: Chrome 120
- OS: macOS 14
- Node: 20.10
```

## Related Documentation

- See [38-code-quality.md](/home/user/tiler2-ui/docs/38-code-quality.md) for quality standards
- See [20-coding-conventions.md](/home/user/tiler2-ui/docs/20-coding-conventions.md) for conventions
- See [37-testing-strategy.md](/home/user/tiler2-ui/docs/37-testing-strategy.md) for testing
- See [03-development-workflow.md](/home/user/tiler2-ui/docs/03-development-workflow.md) for workflow

---

**Next:** [41-security.md](/home/user/tiler2-ui/docs/41-security.md)
