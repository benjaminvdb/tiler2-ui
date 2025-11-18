# Code Quality

This document describes the code quality tools, configurations, and practices used to maintain high standards throughout the codebase.

## Overview

Code quality is maintained through:
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **TypeScript** - Type safety with strict mode
- **Knip** - Dead code detection
- **Pre-commit hooks** - Automated checks (recommended)

## ESLint Configuration

### Configuration File: `/home/user/tiler2-ui/eslint.config.js`

```javascript
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { args: "none", argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "complexity": ["warn", { "max": 10 }],
      "max-depth": ["warn", 4],
      "max-lines-per-function": [
        "warn",
        {
          "max": 100,
          "skipBlankLines": true,
          "skipComments": true,
        },
      ],
      "max-nested-callbacks": ["warn", 3],
    },
  },
);
```

### Key Rules Explained

#### TypeScript Rules

**`@typescript-eslint/no-explicit-any: "warn"`**
- Warns when `any` type is used
- Encourages explicit typing
- Use `unknown` for truly dynamic types

**`@typescript-eslint/no-unused-vars`**
- Warns about unused variables
- Allows underscore-prefixed variables (`_unused`)
- Ignores function arguments (use in interfaces)

**Why:** Catches type safety issues early and maintains clean code.

#### React Rules

**`react-hooks/rules-of-hooks`**
- Enforces Rules of Hooks
- Prevents hooks in conditions/loops
- Ensures consistent hook ordering

**`react-hooks/exhaustive-deps`**
- Validates useEffect dependencies
- Prevents stale closure bugs
- Warns about missing dependencies

**`react-refresh/only-export-components`**
- Ensures Fast Refresh works correctly
- Warns about non-component exports
- Allows constant exports

**Why:** Prevents common React bugs and ensures optimal development experience.

#### Code Complexity Rules

**`complexity: ["warn", { max: 10 }]`**
- Limits cyclomatic complexity to 10
- Encourages function decomposition
- Improves testability

**`max-depth: ["warn", 4]`**
- Limits nesting depth to 4 levels
- Prevents deeply nested code
- Improves readability

**`max-lines-per-function: ["warn", { max: 100 }]`**
- Limits function length to 100 lines
- Excludes blank lines and comments
- Encourages single-responsibility functions

**`max-nested-callbacks: ["warn", 3]`**
- Limits callback nesting to 3 levels
- Prevents "callback hell"
- Encourages async/await or named functions

**Why:** These rules enforce maintainable code structure and prevent overly complex functions.

### Running ESLint

```bash
# Lint all files
pnpm lint

# Lint and auto-fix
pnpm lint:fix

# Lint specific file
pnpm eslint src/features/thread/components/chat-input.tsx
```

### VS Code Integration

Install the ESLint extension and add to `.vscode/settings.json`:

```json
{
  "eslint.enable": true,
  "eslint.validate": ["javascript", "typescript", "typescriptreact"],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

**Why:** Automatic linting on save catches issues immediately.

## Prettier Configuration

### Configuration File: `/home/user/tiler2-ui/prettier.config.js`

```javascript
const config = {
  endOfLine: "auto",
  singleAttributePerLine: true,
  plugins: ["prettier-plugin-tailwindcss"],
};

export default config;
```

### Configuration Explained

**`endOfLine: "auto"`**
- Maintains existing line endings
- Prevents issues on Windows/Unix
- No unnecessary file changes

**`singleAttributePerLine: true`**
- Each React prop on its own line
- Improves diff readability
- Makes code reviews easier

**`plugins: ["prettier-plugin-tailwindcss"]`**
- Automatically sorts Tailwind classes
- Consistent class ordering
- Follows Tailwind's recommended order

**Why:** Consistent formatting reduces cognitive load and eliminates style debates.

### Default Prettier Settings

Prettier uses these defaults (not overridden):
- **printWidth:** 80 characters
- **tabWidth:** 2 spaces
- **semi:** true (semicolons)
- **singleQuote:** false (double quotes)
- **trailingComma:** "all"

### Running Prettier

```bash
# Format all files
pnpm format

# Check formatting without changes
pnpm format:check

# Format specific file
pnpm prettier --write src/features/thread/components/chat-input.tsx
```

### VS Code Integration

Install the Prettier extension and add to `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## TypeScript Strict Mode

### Configuration: `/home/user/tiler2-ui/tsconfig.json`

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### Strict Mode Flags Explained

**`strict: true`**
- Enables all strict type-checking options
- Catches more potential errors
- Foundation for type safety

**`noImplicitAny: true`**
- Forbids implicit `any` types
- Forces explicit type annotations
- Prevents accidental type holes

**`noImplicitReturns: true`**
- Ensures all code paths return a value
- Prevents undefined returns
- Catches logic errors

**`noImplicitThis: true`**
- Requires explicit `this` types
- Prevents `this` confusion
- Improves class method safety

**`noUnusedLocals: true`**
- Warns about unused variables
- Keeps code clean
- Identifies dead code

**`noUnusedParameters: true`**
- Warns about unused function parameters
- Suggests interface cleanup
- Documents parameter usage

**`exactOptionalPropertyTypes: true`**
- Distinguishes `undefined` from absent properties
- Stricter optional property handling
- Prevents subtle bugs

**Why:** Strict mode catches errors at compile time instead of runtime.

### Type Checking

```bash
# Type check without emitting files
pnpm check

# Watch mode for development
pnpm tsc --noEmit --watch
```

## Knip - Dead Code Detection

### Configuration: `/home/user/tiler2-ui/knip.json`

Knip identifies unused files, exports, and dependencies.

```json
{
  "$schema": "https://unpkg.com/knip@5/schema.json",
  "entry": [
    "src/app/**/{page,layout,loading,error,global-error,not-found}.{ts,tsx}",
    "src/app/**/route.ts",
    "src/app/app-layout.tsx",
    "src/app/app-providers.tsx",
    "src/env.ts"
  ],
  "project": ["src/**/*.{ts,tsx}"],
  "ignore": [
    "webpack.config.js",
    "**/*.test.{ts,tsx}",
    "**/*.spec.{ts,tsx}",
    // ... (see file for full list)
  ]
}
```

### Running Knip

```bash
# Find all unused code
pnpm knip

# Production mode (ignores devDependencies)
pnpm knip:production
```

### What Knip Detects

- **Unused files** - Files not imported anywhere
- **Unused exports** - Exports never imported
- **Unused dependencies** - Packages in package.json but not used
- **Unlisted dependencies** - Packages used but not in package.json
- **Duplicate exports** - Same thing exported multiple times

**Why:** Keeps codebase lean by identifying dead code and unused dependencies.

### Addressing Knip Findings

```typescript
// If Knip reports unused export but it's intentional:
// Option 1: Add to knip.json ignore list
// Option 2: Add comment
export const intentionallyUnused = "value"; // Used in tests

// If Knip reports unused file:
// Option 1: Delete the file
// Option 2: Import it somewhere
// Option 3: Add to ignore list if it's entry point
```

## Pre-commit Hooks (Recommended)

Pre-commit hooks run checks before each commit, catching issues early.

### Setup with Husky + lint-staged

```bash
# Install dependencies
pnpm add -D husky lint-staged

# Initialize husky
pnpm exec husky init
```

### Configuration: `/home/user/tiler2-ui/.husky/pre-commit`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint-staged
```

### Configuration: `/home/user/tiler2-ui/package.json`

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "vitest related --run"
    ],
    "*.{json,md,css}": [
      "prettier --write"
    ]
  }
}
```

**Why:** Automated checks prevent committing broken or unformatted code.

## Code Review Checklist

### Before Opening PR

- [ ] All ESLint errors fixed
- [ ] Code formatted with Prettier
- [ ] TypeScript type check passes
- [ ] No unused code (run Knip)
- [ ] Tests pass (when added)
- [ ] No console.log statements (use proper logging)
- [ ] No commented-out code
- [ ] Environment variables documented

### Code Review Focus Areas

#### 1. Type Safety
```typescript
// Bad - implicit any
function process(data) { ... }

// Good - explicit types
function process(data: ThreadState): void { ... }
```

#### 2. Error Handling
```typescript
// Bad - swallowing errors
try { ... } catch {}

// Good - proper error handling
try { ... } catch (error) {
  console.error("Error processing:", error);
  reportError(error);
}
```

#### 3. Performance
```typescript
// Bad - recreating object every render
const config = { apiUrl, assistantId };

// Good - useMemo for expensive computations
const config = useMemo(() => ({ apiUrl, assistantId }), [apiUrl, assistantId]);
```

#### 4. Security
```typescript
// Bad - exposing sensitive data
console.log("Token:", authToken);

// Good - sanitized logging
console.log("Token: [REDACTED]");
```

#### 5. Accessibility
```typescript
// Bad - no accessible label
<button><Icon /></button>

// Good - accessible button
<button aria-label="Send message"><Icon /></button>
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: Code Quality

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4

      - run: pnpm install
      - run: pnpm lint
      - run: pnpm format:check
      - run: pnpm check
      - run: pnpm knip
```

**Why:** CI enforces quality standards on every commit.

## Quality Metrics

### Target Metrics

- **ESLint warnings:** 0
- **TypeScript errors:** 0
- **Prettier violations:** 0
- **Knip findings:** <10 (actively managed)
- **Code coverage:** 70%+ (when tests added)

### Monitoring Quality

```bash
# Run all quality checks
pnpm lint && pnpm format:check && pnpm check && pnpm knip

# Add to package.json
{
  "scripts": {
    "quality": "pnpm lint && pnpm format:check && pnpm check && pnpm knip"
  }
}
```

## Best Practices

### 1. Fix Warnings Immediately

Don't let warnings accumulate:
```bash
# Fix automatically when possible
pnpm lint:fix
pnpm format
```

### 2. Configure Editor

Set up your editor for instant feedback:
- ESLint extension
- Prettier extension
- TypeScript language server
- Format on save enabled

### 3. Run Checks Before Commit

```bash
# Manual check before commit
pnpm lint && pnpm check
```

### 4. Address Knip Findings

Review Knip output monthly and clean up:
- Remove unused files
- Delete unused exports
- Uninstall unused dependencies

### 5. Use Type Annotations

```typescript
// Explicit return types improve type safety
function getMessage(): string {
  return "Hello";
}

// Type parameters for clarity
const messages: Message[] = [];

// Interface for object shapes
interface Props {
  onSubmit: (value: string) => void;
}
```

## Common Issues and Solutions

### Issue: ESLint "Parsing error"

**Cause:** TypeScript configuration mismatch

**Solution:**
```bash
# Regenerate TypeScript cache
rm -rf node_modules/.cache
pnpm install
```

### Issue: Prettier and ESLint Conflict

**Cause:** Conflicting formatting rules

**Solution:** ESLint and Prettier are already configured to work together. If conflicts occur:
```bash
# Prettier always wins for formatting
pnpm format
pnpm lint:fix
```

### Issue: Knip False Positives

**Cause:** Dynamic imports or external usage

**Solution:** Add to `knip.json` ignore list:
```json
{
  "ignore": [
    "src/features/intentional-export/**"
  ]
}
```

### Issue: TypeScript "Cannot find module"

**Cause:** Path alias not configured

**Solution:** Check `tsconfig.json` paths match `vite.config.ts` aliases.

## Related Documentation

- See [37-testing-strategy.md](/home/user/tiler2-ui/docs/37-testing-strategy.md) for testing
- See [20-coding-conventions.md](/home/user/tiler2-ui/docs/20-coding-conventions.md) for conventions
- See [45-anti-patterns.md](/home/user/tiler2-ui/docs/45-anti-patterns.md) for what to avoid
- See [40-contributing.md](/home/user/tiler2-ui/docs/40-contributing.md) for contribution guidelines

---

**Next:** [39-debugging.md](/home/user/tiler2-ui/docs/39-debugging.md)
