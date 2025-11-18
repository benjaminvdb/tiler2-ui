# Coding Conventions

This document outlines the TypeScript and code conventions used in the Tiler2 UI project. These conventions ensure consistency, maintainability, and code quality across the codebase.

## Table of Contents

- [TypeScript Patterns](#typescript-patterns)
- [Naming Conventions](#naming-conventions)
- [File Organization](#file-organization)
- [Import/Export Patterns](#importexport-patterns)
- [JSDoc Requirements](#jsdoc-requirements)
- [Code Style (ESLint)](#code-style-eslint)
- [Formatting (Prettier)](#formatting-prettier)
- [TypeScript Strict Mode](#typescript-strict-mode)
- [Type Definition Patterns](#type-definition-patterns)
- [Best Practices](#best-practices)
- [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

## TypeScript Patterns

### Strict Mode Configuration

The project uses TypeScript strict mode with enhanced safety checks configured in `/home/user/tiler2-ui/tsconfig.json`:

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

**Why:** These settings catch potential bugs at compile time, enforce explicit typing, and ensure all code paths return values.

### Type Inference vs Explicit Types

**Prefer type inference for simple cases:**

```typescript
// Good - type is inferred as string
const userName = "Alice";

// Bad - unnecessary annotation
const userName: string = "Alice";
```

**Use explicit types for function parameters and return types:**

```typescript
// Good - clear parameter and return types
export function calculateTotal(items: number[], tax: number): number {
  const subtotal = items.reduce((sum, item) => sum + item, 0);
  return subtotal * (1 + tax);
}

// Bad - implicit return type
export function calculateTotal(items: number[], tax: number) {
  return items.reduce((sum, item) => sum + item, 0) * (1 + tax);
}
```

**Why:** Explicit function signatures serve as inline documentation and catch type errors at function boundaries.

### Type Aliases vs Interfaces

**Use type aliases for:**
- Union types
- Intersection types
- Mapped types
- Utility type compositions

```typescript
// Good - union type
export type EventHandler<T = Event> = (event: T) => void;
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>;

// Good - intersection type
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
```

**Use interfaces for:**
- Object shapes
- Component props
- API contracts

```typescript
// Good - object shape
export interface ThreadMetadata {
  id: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

// Good - component props
interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}
```

**Why:** Interfaces are better for object shapes because they support declaration merging and provide clearer error messages. Type aliases are more flexible for complex type transformations.

## Naming Conventions

### Files

**Component files:** Use kebab-case with `.tsx` extension

```
thread-actions-menu.tsx
delete-thread-confirm-dialog.tsx
side-panel-layout.tsx
```

**Hook files:** Prefix with `use-` and kebab-case with `.ts` extension

```
use-thread-state.ts
use-media-query.tsx
use-file-upload.tsx
```

**Type/utility files:** Use kebab-case with `.ts` extension

```
types.ts
utils.ts
constants.ts
```

**Why:** Kebab-case is web-standard, URL-safe, and easy to read.

### Components

**Use PascalCase for component names:**

```typescript
// Good
export const ThreadActionsMenu = ({ threadId }: Props) => { ... }
export const ChatInput = React.memo(ChatInputComponent);

// Bad
export const threadActionsMenu = ({ threadId }: Props) => { ... }
export const chatInput = () => { ... }
```

**Why:** PascalCase distinguishes components from regular functions and follows React conventions.

### Functions

**Use camelCase for function names:**

```typescript
// Good
export function useThreadState(): ThreadStateValue { ... }
function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) { ... }
const createSubmitHandler = (props: Props) => { ... }

// Bad
export function UseThreadState() { ... }
function HandleFileUpload() { ... }
```

**Why:** camelCase is the JavaScript/TypeScript standard for functions and distinguishes them from components.

### Variables

**Use camelCase for variables:**

```typescript
// Good
const firstName = "Alice";
const isLoading = false;
const userCount = 42;

// Bad
const FirstName = "Alice";
const is_loading = false;
const user_count = 42;
```

**Why:** Follows JavaScript conventions and improves readability.

### Constants

**Use UPPER_SNAKE_CASE for true constants:**

```typescript
// Good - file: /home/user/tiler2-ui/src/features/file-upload/hooks/constants.ts
export const SUPPORTED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
```

**Use camelCase for config objects:**

```typescript
// Good
export const clientConfig = {
  apiUrl: import.meta.env.VITE_API_URL,
  assistantId: import.meta.env.VITE_ASSISTANT_ID,
};
```

**Why:** UPPER_SNAKE_CASE signals immutable values. Config objects are camelCase because they're structured data, not single values.

### Types and Interfaces

**Use PascalCase for types and interfaces:**

```typescript
// Good
export interface ThreadMetadata { ... }
export type JsonValue = string | number | boolean | null;
export type EventHandler<T = Event> = (event: T) => void;

// Bad
export interface thread_metadata { ... }
export type json_value = string | number;
```

**Don't prefix interfaces with `I`:**

```typescript
// Good
export interface ThreadState { ... }

// Bad
export interface IThreadState { ... }
```

**Why:** PascalCase is TypeScript standard. The `I` prefix is a legacy convention from C# and is not used in modern TypeScript.

### Props Type Naming

**Suffix component prop types with `Props`:**

```typescript
// Good
interface ThreadActionsMenuProps {
  threadId: string;
  threadTitle: string;
  onRename: (threadId: string, newTitle: string) => Promise<void>;
  onDelete: (threadId: string) => Promise<void>;
}

export const ThreadActionsMenu = ({
  threadId,
  threadTitle,
  onRename,
  onDelete,
}: ThreadActionsMenuProps): React.JSX.Element => { ... }
```

**Why:** Clear naming convention makes it obvious which types are component props.

## File Organization

### Module Structure

Organize files using the feature-based structure:

```
src/
├── features/           # Feature modules
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── providers/
│   │   └── types.ts
│   ├── chat/
│   └── thread/
├── shared/            # Shared/reusable code
│   ├── components/
│   ├── hooks/
│   ├── types/
│   └── utils/
├── core/              # Core application logic
│   ├── config/
│   ├── providers/
│   ├── routing/
│   └── services/
└── app/               # Application entry and pages
```

**Why:** Feature-based organization scales better than layer-based (all components in one folder). Related code stays together.

### Component File Structure

Organize component files in this order:

```typescript
// 1. Imports - external libraries first, then internal
import React, { useState } from "react";
import { MoreHorizontal, Edit2, Trash2 } from "lucide-react";
import { DropdownMenu } from "@/shared/components/ui/dropdown-menu";
import { RenameThreadDialog } from "./dialogs/rename-thread-dialog";

// 2. Types and interfaces
interface ThreadActionsMenuProps {
  threadId: string;
  threadTitle: string;
  onRename: (threadId: string, newTitle: string) => Promise<void>;
  onDelete: (threadId: string) => Promise<void>;
}

// 3. Component implementation
export const ThreadActionsMenu = ({
  threadId,
  threadTitle,
  onRename,
  onDelete,
}: ThreadActionsMenuProps): React.JSX.Element => {
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);

  return (
    // ... JSX
  );
};
```

**Why:** Consistent structure makes code easier to scan and understand.

### Index Files

Use index files for clean public APIs:

```typescript
// features/auth/hooks/index.ts
export { useAccessToken } from "./use-access-token";
export { useAuth } from "./use-auth";
```

**Don't re-export everything:**

```typescript
// Bad - exposes internal implementation
export * from "./use-access-token";
export * from "./internal-helper"; // Internal, shouldn't be exported
```

**Why:** Explicit exports create clear public APIs and hide implementation details.

## Import/Export Patterns

### Path Aliases

Use path aliases defined in `/home/user/tiler2-ui/tsconfig.json`:

```typescript
// Good - use aliases
import { cn } from "@/shared/utils/utils";
import { useThreadState } from "@/features/thread/components/hooks/use-thread-state";
import { ChatProvider } from "@/features/chat/providers/chat-provider";

// Bad - relative paths across features
import { cn } from "../../../../shared/utils/utils";
import { useThreadState } from "../../thread/components/hooks/use-thread-state";
```

**Available aliases:**
- `@/*` - `/home/user/tiler2-ui/src/*`
- `@/features/*` - `/home/user/tiler2-ui/src/features/*`
- `@/shared/*` - `/home/user/tiler2-ui/src/shared/*`
- `@/core/*` - `/home/user/tiler2-ui/src/core/*`

**Why:** Aliases make imports cleaner, easier to refactor, and prevent brittle relative paths.

### Named Exports (Preferred)

**Always prefer named exports:**

```typescript
// Good - named exports
export const Button: React.FC<ButtonProps> = ({ ... }) => { ... }
export const buttonVariants = cva(...);
export type ButtonProps = ...;

// Bad - default export
export default function Button({ ... }) { ... }
```

**Why:**
- Named exports enable better tree-shaking
- Refactoring tools work better (rename works across files)
- Import statements are more explicit
- Multiple exports from one file are cleaner

### Import Order

Group imports in this order:

```typescript
// 1. External libraries
import React, { useState, useCallback } from "react";
import { Send, Plus, Loader2 } from "lucide-react";

// 2. Path alias imports (grouped by @/core, @/features, @/shared)
import { useStreamContext } from "@/core/providers/stream";
import { ChatProvider } from "@/features/chat/providers/chat-provider";
import { cn } from "@/shared/utils/utils";

// 3. Relative imports
import { ContentBlocksPreview } from "../content-blocks-preview";
import { InterruptIndicator } from "./components/interrupt-indicator";
import { ChatInputProps } from "./types";
```

**Why:** Consistent ordering makes imports scannable and reduces merge conflicts.

## JSDoc Requirements

### Exported Functions

**All exported functions must have JSDoc comments:**

```typescript
/**
 * Route wrapper that requires authentication via Auth0.
 * Redirects to login if not authenticated, shows loading screen during auth check.
 * @param children - Components to render when user is authenticated
 * @returns Protected route content or loading screen
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // ... implementation
}
```

**Why:** JSDoc provides inline documentation for consumers and powers IDE tooltips.

### Type Definitions

**Document complex types:**

```typescript
/**
 * Multimodal content blocks representing uploaded files or images.
 * Conforms to LangChain's content block standard for interoperability with LangGraph.
 */
export type MultimodalContentBlock =
  | LangChainContentBlock.Multimodal.Image
  | LangChainContentBlock.Multimodal.File;

/**
 * Complete thread state including conversation history and UI state.
 * Synchronized with URL search params for browser history support.
 */
export interface ThreadState {
  threadId: string | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}
```

**Why:** Complex types need context about their purpose and relationships to other types.

### Hook Documentation

**Document custom hooks with usage examples:**

```typescript
/**
 * Custom hook for managing file uploads with drag-and-drop support.
 * Handles file validation, preview generation, and content block management.
 *
 * @param options - Configuration options
 * @param options.initialBlocks - Initial content blocks to display
 * @returns File upload handlers and state
 *
 * @example
 * ```tsx
 * const { contentBlocks, handleFileUpload, dropRef } = useFileUpload({
 *   initialBlocks: []
 * });
 * ```
 */
export function useFileUpload({ initialBlocks = [] }: UseFileUploadOptions = {}) {
  // ... implementation
}
```

**Why:** Hooks are reusable utilities that benefit from clear documentation and examples.

## Code Style (ESLint)

### ESLint Configuration

The project uses TypeScript ESLint with React-specific rules (see `/home/user/tiler2-ui/eslint.config.js`):

```javascript
{
  rules: {
    // TypeScript
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { args: "none", argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
    ],

    // React
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],

    // Code complexity
    "complexity": ["warn", { "max": 10 }],
    "max-depth": ["warn", 4],
    "max-lines-per-function": ["warn", { "max": 100, "skipBlankLines": true, "skipComments": true }],
    "max-nested-callbacks": ["warn", 3]
  }
}
```

### Avoiding `any`

**Use specific types instead of `any`:**

```typescript
// Good - specific type
function processMessage(message: Message): void { ... }

// Good - unknown for truly unknown data
function parseJSON(data: string): unknown { ... }

// Bad - any bypasses type checking
function processMessage(message: any): void { ... }
```

**Why:** `any` disables type checking and defeats the purpose of TypeScript.

### Unused Variables

**Remove or prefix with underscore:**

```typescript
// Good - used variable
const [count, setCount] = useState(0);

// Good - prefixed unused variable
const [_count, setCount] = useState(0);

// Bad - unused variable
const [count, setCount] = useState(0);
```

**Why:** Unused variables indicate dead code or incomplete refactoring.

### Complexity Limits

**Keep functions simple (cyclomatic complexity ≤ 10):**

```typescript
// Good - simple function
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Bad - too complex (too many conditions)
function validateForm(data: FormData): boolean {
  if (!data.email) return false;
  if (!data.password) return false;
  if (data.password.length < 8) return false;
  if (!data.name) return false;
  if (!data.age) return false;
  if (data.age < 18) return false;
  // ... more conditions
  return true;
}

// Good - refactored into smaller functions
function validateForm(data: FormData): boolean {
  return validateEmail(data.email) &&
         validatePassword(data.password) &&
         validateProfile(data);
}
```

**Why:** Complex functions are harder to test, understand, and maintain.

## Formatting (Prettier)

### Prettier Configuration

The project uses Prettier with Tailwind plugin (see `/home/user/tiler2-ui/prettier.config.js`):

```javascript
{
  endOfLine: "auto",
  singleAttributePerLine: true,
  plugins: ["prettier-plugin-tailwindcss"]
}
```

### Single Attribute Per Line

**React props:**

```tsx
// Good - one attribute per line
<DropdownMenuTrigger asChild>
  <button
    onClick={(e) => e.stopPropagation()}
    aria-label="Thread actions"
  >
    <MoreHorizontal className="h-4 w-4" />
  </button>
</DropdownMenuTrigger>

// Bad - multiple attributes on one line
<button onClick={(e) => e.stopPropagation()} aria-label="Thread actions">
  <MoreHorizontal className="h-4 w-4" />
</button>
```

**Why:** Easier to read and reduces diff noise in version control.

### Tailwind Class Ordering

Prettier automatically sorts Tailwind classes:

```tsx
// Before formatting
<div className="text-white bg-primary rounded-md p-4 hover:bg-primary/90">

// After Prettier (with tailwindcss plugin)
<div className="rounded-md bg-primary p-4 text-white hover:bg-primary/90">
```

**Why:** Consistent class ordering improves readability and reduces diff noise.

## TypeScript Strict Mode

### No Implicit Any

**Always specify types for parameters:**

```typescript
// Good
function greet(name: string): void {
  console.log(`Hello, ${name}`);
}

// Bad - triggers error with noImplicitAny
function greet(name) {
  console.log(`Hello, ${name}`);
}
```

### No Implicit Returns

**All code paths must return a value:**

```typescript
// Good
function getStatus(isActive: boolean): string {
  if (isActive) {
    return "active";
  }
  return "inactive";
}

// Bad - triggers error with noImplicitReturns
function getStatus(isActive: boolean): string {
  if (isActive) {
    return "active";
  }
  // Missing return for else case
}
```

### Exact Optional Property Types

**Distinguish between `undefined` and missing properties:**

```typescript
// With exactOptionalPropertyTypes: true
interface User {
  name: string;
  email?: string; // Can be missing or string, NOT undefined
}

// Good
const user1: User = { name: "Alice" };
const user2: User = { name: "Bob", email: "bob@example.com" };

// Bad - error with exactOptionalPropertyTypes
const user3: User = { name: "Charlie", email: undefined };
```

**Why:** This catches bugs where `undefined` is explicitly set instead of omitting the property.

## Type Definition Patterns

### Utility Types

Use TypeScript utility types for type transformations:

```typescript
// Prettify - flattens types for better IntelliSense
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

// Optional - makes specific keys optional
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// NonEmptyArray - array with at least one element
export type NonEmptyArray<T> = [T, ...T[]];
```

### Discriminated Unions

Use discriminated unions for type-safe variants:

```typescript
// Good - discriminated union
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function handleResponse<T>(response: ApiResponse<T>) {
  if (response.success) {
    // TypeScript knows response.data exists
    console.log(response.data);
  } else {
    // TypeScript knows response.error exists
    console.error(response.error);
  }
}

// Bad - non-discriminated
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
```

**Why:** Discriminated unions provide exhaustive checking and better type narrowing.

### Generic Constraints

Use constraints to make generics more specific:

```typescript
// Good - constrained generic
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// Good - constrained to React component props
function withLoading<P extends { isLoading?: boolean }>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  // ... implementation
}
```

**Why:** Constraints provide better type safety and IDE autocomplete.

## Best Practices

### Use const Assertions

```typescript
// Good - readonly tuple
export const SUPPORTED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
] as const;

type FileType = typeof SUPPORTED_FILE_TYPES[number]; // "image/jpeg" | "image/png" | "application/pdf"

// Bad - mutable array
export const SUPPORTED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];
```

**Why:** `as const` makes values deeply readonly and creates literal types.

### Avoid Type Casting

```typescript
// Good - type guard
function isMessage(value: unknown): value is Message {
  return typeof value === "object" &&
         value !== null &&
         "id" in value &&
         "content" in value;
}

if (isMessage(data)) {
  console.log(data.content); // TypeScript knows data is Message
}

// Bad - type casting
const message = data as Message;
console.log(message.content); // Might fail at runtime
```

**Why:** Type guards provide runtime safety. Type casting bypasses type checking.

### Prefer Type Inference

```typescript
// Good - inferred types
const userName = "Alice";
const userAge = 30;
const isActive = true;

// Bad - redundant annotations
const userName: string = "Alice";
const userAge: number = 30;
const isActive: boolean = true;
```

**Why:** Type inference reduces verbosity while maintaining type safety.

### Use Readonly for Props

```typescript
// Good - readonly props
interface ComponentProps {
  readonly items: ReadonlyArray<string>;
  readonly config: Readonly<{ apiUrl: string }>;
}

// Better - React.FC enforces readonly props
const Component: React.FC<ComponentProps> = ({ items, config }) => {
  // items and config are readonly
};
```

**Why:** Prevents accidental mutations and enforces immutability.

## Anti-Patterns to Avoid

### Don't Use Enums (Use Union Types Instead)

```typescript
// Bad - enum
enum Status {
  Active = "active",
  Inactive = "inactive",
}

// Good - union type
type Status = "active" | "inactive";

// Good - const object for exhaustive values
const STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

type Status = typeof STATUS[keyof typeof STATUS];
```

**Why:** Enums generate runtime code and have quirky behavior. Union types are simpler and type-safe.

### Don't Use `Function` Type

```typescript
// Bad - too broad
type Handler = Function;

// Good - specific signature
type Handler = (event: Event) => void;

// Good - generic handler
type Handler<T = Event> = (event: T) => void;
```

**Why:** `Function` type doesn't provide parameter or return type safety.

### Don't Use `Object` or `{}`

```typescript
// Bad - too permissive
function process(data: Object) { ... }
function process(data: {}) { ... }

// Good - specific type
function process(data: Record<string, unknown>) { ... }

// Better - defined interface
interface ProcessData {
  id: string;
  value: number;
}
function process(data: ProcessData) { ... }
```

**Why:** `Object` and `{}` don't provide meaningful type information.

### Don't Overuse Optional Chaining

```typescript
// Bad - excessive optional chaining
const email = user?.profile?.contact?.email?.toLowerCase();

// Good - validate structure first
if (!user?.profile?.contact?.email) {
  throw new Error("User email not found");
}
const email = user.profile.contact.email.toLowerCase();
```

**Why:** Excessive optional chaining can hide bugs and make debugging harder.

### Don't Ignore TypeScript Errors with `@ts-ignore`

```typescript
// Bad - suppressing errors
// @ts-ignore
const result = dangerousOperation(invalidData);

// Good - fix the type issue
const result = dangerousOperation(validatedData as ValidData);

// Better - use type guard
if (isValidData(data)) {
  const result = dangerousOperation(data);
}
```

**Why:** `@ts-ignore` suppresses errors without solving the underlying type issue.

### Don't Mix Promises and Callbacks

```typescript
// Bad - mixing async styles
function fetchData(callback: (data: Data) => void): Promise<void> {
  return fetch("/api/data")
    .then(res => res.json())
    .then(data => callback(data));
}

// Good - use async/await
async function fetchData(): Promise<Data> {
  const res = await fetch("/api/data");
  return res.json();
}
```

**Why:** Mixing async patterns creates confusion and makes error handling harder.

## Next Steps

Continue to **[21-react-patterns.md](/home/user/tiler2-ui/docs/21-react-patterns.md)** to learn about React component patterns, hooks, and best practices.

---

**Related Documentation:**
- [05-project-structure.md](/home/user/tiler2-ui/docs/05-project-structure.md) - File organization and module structure
- [06-state-management.md](/home/user/tiler2-ui/docs/06-state-management.md) - State management patterns
- [21-react-patterns.md](/home/user/tiler2-ui/docs/21-react-patterns.md) - React-specific patterns

**Configuration Files:**
- `/home/user/tiler2-ui/tsconfig.json` - TypeScript configuration
- `/home/user/tiler2-ui/eslint.config.js` - ESLint rules
- `/home/user/tiler2-ui/prettier.config.js` - Prettier formatting
